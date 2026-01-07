import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, ChevronUp, ChevronDown } from 'lucide-react'
import { supabase, getCurrentUser } from '../../lib/supabase'
import { handleApiError } from '../../utils/toast'

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [chatGroups, setChatGroups] = useState([])
  const [currentUserId, setCurrentUserId] = useState(null)
  const messagesEndRef = useRef(null)

  // Get current user ID
  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) setCurrentUserId(user.id)
    })
  }, [])

  // Fetch enrolled courses as chat groups
  useEffect(() => {
    const fetchChatGroups = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) return

        const { data, error } = await supabase
          .from('enrollments')
          .select(`
            course_id,
            courses!inner(
              id,
              title,
              teacher_id,
              profiles!teacher_id(full_name)
            )
          `)
          .eq('student_id', user.id)

        if (error) throw error
        if (data) {
          const groups = data.map((enrollment) => ({
            id: enrollment.courses.id,
            courseTitle: enrollment.courses.title,
            teacherName: enrollment.courses.profiles?.full_name || 'Öğretmen',
            unreadCount: 0, // TODO: Calculate unread count
          }))
          setChatGroups(groups)
        }
      } catch (error) {
        handleApiError(error)
      }
    }

    if (isOpen) {
      fetchChatGroups()
    }
  }, [isOpen])

  // Realtime subscription for messages
  useEffect(() => {
    if (!selectedGroup) return

    const channel = supabase
      .channel(`messages:${selectedGroup}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${selectedGroup}`,
        },
        (payload) => {
          // Fetch full message with sender name
          supabase
            .from('messages')
            .select('*, profiles!messages_sender_id_fkey(full_name)')
            .eq('id', payload.new.id)
            .single()
            .then(({ data }) => {
              if (data) {
                setMessages((prev) => [
                  ...prev,
                  {
                    ...data,
                    sender_name: data.profiles?.full_name || 'Bilinmeyen',
                  },
                ])
              }
            })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedGroup])

  // Fetch messages when group is selected
  useEffect(() => {
    if (selectedGroup) {
      const fetchMessages = async () => {
        try {
          const { data, error } = await supabase
            .from('messages')
            .select('*, profiles!messages_sender_id_fkey(full_name)')
            .eq('group_id', selectedGroup)
            .order('created_at', { ascending: true })

          if (error) throw error
          if (data) {
            const transformed = data.map((msg) => ({
              ...msg,
              sender_name: msg.profiles?.full_name || 'Bilinmeyen',
            }))
            setMessages(transformed)
          }
        } catch (error) {
          handleApiError(error)
        }
      }

      fetchMessages()
    } else {
      setMessages([])
    }
  }, [selectedGroup])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedGroup) return

    try {
      const user = await getCurrentUser()
      if (!user) {
        throw new Error('Giriş yapmanız gerekiyor')
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: newMessage,
          sender_id: user.id,
          group_id: selectedGroup,
        })
        .select('*, profiles!messages_sender_id_fkey(full_name)')
        .single()

      if (error) throw error

      // Message will be added via realtime subscription, but add optimistically
      if (data) {
        setMessages((prev) => [
          ...prev,
          {
            ...data,
            sender_name: data.profiles?.full_name || 'Ben',
          },
        ])
      }
      setNewMessage('')
    } catch (error) {
      handleApiError(error)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const selectedGroupData = chatGroups.find((g) => g.id === selectedGroup)

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-colors duration-200 flex items-center justify-center z-50"
        aria-label="Chat'i aç"
      >
        <MessageCircle size={24} />
        {chatGroups.reduce((sum, g) => sum + g.unreadCount, 0) > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {chatGroups.reduce((sum, g) => sum + g.unreadCount, 0)}
          </span>
        )}
      </button>
    )
  }

  return (
    <div
      className={`fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col ${
        isMinimized ? 'h-16' : 'h-[600px]'
      } transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-primary-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <MessageCircle className="text-primary-600" size={20} />
          <h3 className="font-semibold text-gray-900">
            {selectedGroupData ? selectedGroupData.courseTitle : 'Mesajlar'}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <button
            onClick={() => {
              setIsOpen(false)
              setIsMinimized(false)
              setSelectedGroup(null)
            }}
            className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {!selectedGroup ? (
            /* Group List */
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {chatGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroup(group.id)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
                  >
                    <div className="font-medium text-gray-900">{group.courseTitle}</div>
                    <div className="text-sm text-gray-600">{group.teacherName}</div>
                    {group.unreadCount > 0 && (
                      <div className="mt-1 text-xs text-primary-600 font-medium">
                        {group.unreadCount} yeni mesaj
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  const isOwnMessage = message.sender_id === currentUserId
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          isOwnMessage
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {!isOwnMessage && (
                          <div className="text-xs font-medium mb-1 opacity-80">
                            {message.sender_name}
                          </div>
                        )}
                        <div className="text-sm">{message.content}</div>
                        <div
                          className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                          }`}
                        >
                          {formatTime(message.created_at)}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Mesaj yazın..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default ChatWidget

