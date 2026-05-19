import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

export default function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [message, setMessage] = useState('')
  const [deliverAt, setDeliverAt] = useState('')
  const [futureMessages, setFutureMessages] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchFutureMessages()
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (session) fetchFutureMessages()
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signIn() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) alert(error.message)
    else alert('Check your email 💌')
    setLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setFutureMessages([])
  }

  async function fetchFutureMessages() {
    const { data, error } = await supabase
      .from('future_messages')
      .select('*')
      .order('deliver_at', { ascending: true })

    if (error) alert(error.message)
    else setFutureMessages(data)
  }

  async function saveFutureMessage() {
    if (!recipientName || !recipientEmail || !message || !deliverAt) {
      alert('Fill in all the boxes first')
      return
    }

    const { error } = await supabase.from('future_messages').insert({
      user_id: session.user.id,
      recipient_name: recipientName,
      recipient_email: recipientEmail,
      message,
      deliver_at: deliverAt,
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Future message saved 💌')
      setRecipientName('')
      setRecipientEmail('')
      setMessage('')
      setDeliverAt('')
      fetchFutureMessages()
    }
  }

  async function deleteFutureMessage(id) {
    const { error } = await supabase
      .from('future_messages')
      .delete()
      .eq('id', id)

    if (error) alert(error.message)
    else fetchFutureMessages()
  }

  if (session) {
    return (
      <main style={{ minHeight: '100vh', background: '#f8f4ee', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <h1>Rememberly ✨</h1>
          <p>Welcome back.</p>

          <div style={{ background: 'white', padding: '24px', borderRadius: '24px', marginTop: '24px' }}>
            <h2>Future Messages</h2>
            <p>Write something meaningful for later.</p>

            <input placeholder="Recipient name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} style={inputStyle} />
            <input type="email" placeholder="Recipient email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} style={inputStyle} />
            <textarea placeholder="Write a future message..." value={message} onChange={(e) => setMessage(e.target.value)} style={{ ...inputStyle, minHeight: '120px' }} />
            <input type="datetime-local" value={deliverAt} onChange={(e) => setDeliverAt(e.target.value)} style={inputStyle} />

            <button onClick={saveFutureMessage} style={primaryButton}>
              Save future message
            </button>
          </div>

          <div style={{ marginTop: '24px' }}>
            <h2>Saved Messages</h2>

            {futureMessages.length === 0 ? (
              <p>No future messages yet.</p>
            ) : (
              futureMessages.map((item) => (
                <div key={item.id} style={messageCard}>
                  <strong>Future message for {item.recipient_name}</strong>
                  <p>{item.message}</p>
                  <small>{new Date(item.deliver_at).toLocaleString()}</small>
                  <br />
                  <button onClick={() => deleteFutureMessage(item.id)} style={deleteButton}>
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>

          <button onClick={signOut} style={{ ...primaryButton, marginTop: '24px' }}>
            Sign out
          </button>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f8f4ee', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: 'white', padding: '32px', borderRadius: '32px' }}>
        <p style={{ color: '#8d765f', fontWeight: '700' }}>Rememberly</p>
        <h1>Remember the people who matter.</h1>

        <input placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />

        <button onClick={signIn} disabled={loading} style={primaryButton}>
          {loading ? 'Loading...' : 'Continue'}
        </button>
      </div>
    </main>
  )
}

const inputStyle = {
  width: '100%',
  padding: '14px',
  borderRadius: '14px',
  border: '1px solid #ddd',
  marginBottom: '12px',
}

const primaryButton = {
  width: '100%',
  padding: '14px',
  borderRadius: '999px',
  border: 'none',
  background: '#2b2b2b',
  color: 'white',
  fontWeight: '700',
}

const messageCard = {
  background: 'white',
  padding: '24px',
  borderRadius: '28px',
  marginBottom: '16px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
}

const deleteButton = {
  marginTop: '12px',
  padding: '10px 16px',
  borderRadius: '999px',
  border: 'none',
  background: '#f3eee7',
}