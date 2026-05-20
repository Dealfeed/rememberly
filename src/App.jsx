import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

export default function App() {
  const [session, setSession] = useState(null)
  const [activeTab, setActiveTab] = useState('home')
  const [darkMode, setDarkMode] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [deliverAt, setDeliverAt] = useState('')
  const [futureMessages, setFutureMessages] = useState([])

  const [people, setPeople] = useState([])
  const [personName, setPersonName] = useState('')
  const [personType, setPersonType] = useState('')
  const [personEmail, setPersonEmail] = useState('')
  const [personBirthday, setPersonBirthday] = useState('')
const [personAvatar, setPersonAvatar] = useState(null)
  const [memories, setMemories] = useState([])
  const [memoryTitle, setMemoryTitle] = useState('')
  const [memoryDescription, setMemoryDescription] = useState('')
  const [memoryPersonId, setMemoryPersonId] = useState('')
  const [memoryDate, setMemoryDate] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchFutureMessages()
        fetchPeople()
        fetchMemories()
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (session) {
          fetchFutureMessages()
          fetchPeople()
          fetchMemories()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signIn() {
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })

    if (error) alert(error.message)
    else alert('Check your email')

    setLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setFutureMessages([])
    setPeople([])
    setMemories([])
  }

  async function fetchFutureMessages() {
    const { data, error } = await supabase
      .from('future_messages')
      .select('*')
      .order('deliver_at', { ascending: true })

    if (error) alert(error.message)
    else setFutureMessages(data || [])
  }

  async function fetchPeople() {
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) alert(error.message)
    else setPeople(data || [])
  }

  async function fetchMemories() {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('memory_date', { ascending: false })

    if (error) alert(error.message)
    else setMemories(data || [])
  }

  async function saveFutureMessage() {
    if (!recipientName || !recipientEmail || !subject || !message || !deliverAt) {
      alert('Fill in all the boxes first')
      return
    }

    const { error } = await supabase.from('future_messages').insert({
      user_id: session.user.id,
      recipient_name: recipientName,
      recipient_email: recipientEmail,
      subject,
      message,
      deliver_at: deliverAt,
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Message scheduled')
      setRecipientName('')
      setRecipientEmail('')
      setSubject('')
      setMessage('')
      setDeliverAt('')
      fetchFutureMessages()
      setActiveTab('timeline')
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

  async function savePerson() {
    if (!personName) {
      alert('Add a name first')
      return
    }
let avatarUrl = null

if (personAvatar) {
  const filePath = `${Date.now()}-${personAvatar.name}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, personAvatar)

  if (!uploadError) {
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    avatarUrl = data.publicUrl
  }
}
    const { error } = await supabase.from('people').insert({
      user_id: session.user.id,
      name: personName,
      relationship_type: personType,
      email: personEmail,
      birthday: personBirthday || null,
      avatar_url: avatarUrl,
    })

    if (error) {
      alert(error.message)
    } else {
      setPersonName('')
      setPersonType('')
      setPersonEmail('')
      setPersonBirthday('')
      fetchPeople()
    }
  }

  async function deletePerson(id) {
    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', id)

    if (error) alert(error.message)
    else fetchPeople()
  }

  async function saveMemory() {
    if (!memoryTitle || !memoryPersonId) {
      alert('Add a title and person')
      return
    }

    const { error } = await supabase.from('memories').insert({
      user_id: session.user.id,
      person_id: memoryPersonId,
      title: memoryTitle,
      description: memoryDescription,
      memory_date: memoryDate || null,
    })

    if (error) {
      alert(error.message)
    } else {
      setMemoryTitle('')
      setMemoryDescription('')
      setMemoryPersonId('')
      setMemoryDate('')
      fetchMemories()
    }
  }

  const pendingMessages = futureMessages.filter((item) => !item.delivered)
  const deliveredMessages = futureMessages.filter((item) => item.delivered)

  if (!session) {
    return (
      <main style={styles.authShell}>
        <div style={styles.authCard}>
          <p style={styles.brand}>Rememberly</p>
          <h1 style={styles.authTitle}>Remember the people who matter.</h1>
          <p style={styles.muted}>Send thoughtful messages, save future moments, and stay close to people without turning life into a task list.</p>

          <input
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <button onClick={signIn} disabled={loading} style={styles.primaryButton}>
            {loading ? 'Loading...' : 'Continue'}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main style={styles.appShell}>
      <div style={styles.phone}>
        <header style={styles.header}>
          <div>
            <p style={styles.brand}>Rememberly</p>
            <h1 style={styles.pageTitle}>
              {activeTab === 'home' && 'Today'}
              {activeTab === 'people' && 'People'}
              {activeTab === 'memories' && 'Memories'}
              {activeTab === 'compose' && 'New message'}
              {activeTab === 'timeline' && 'Timeline'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
          </div>

          <button onClick={signOut} style={styles.smallButton}>
            Sign out
          </button>
        </header>

        <section style={styles.content}>
          {activeTab === 'home' && (
            <>
              <div style={styles.heroCard}>
                <p style={styles.cardLabel}>Gentle reminder</p>
                <h2 style={styles.heroTitle}>You have {pendingMessages.length} message{pendingMessages.length === 1 ? '' : 's'} waiting for the right moment.</h2>
                <button onClick={() => setActiveTab('compose')} style={styles.lightButton}>
                  Schedule one
                </button>
              </div>

              <h3 style={styles.sectionTitle}>People you care about</h3>
              <div style={styles.peopleRow}>
                {people.length === 0 ? (
                  <p style={styles.empty}>Add your first person.</p>
                ) : (
                  people.slice(0, 3).map((person) => (
                    <div key={person.id} style={styles.personCard}>
                      {person.avatar_url ? (
  <img
    src={person.avatar_url}
    alt={person.name}
    style={styles.avatarImage}
  />
) : (
  <div style={styles.avatar}>{person.name[0]}</div>
)}
                      <strong>{person.name}</strong>
                      <small style={styles.muted}>{person.relationship_type || 'Relationship'}</small>
                    </div>
                  ))
                )}
              </div>

              <h3 style={styles.sectionTitle}>Recent memories</h3>
              {memories.length === 0 ? (
                <p style={styles.empty}>No memories saved yet.</p>
              ) : (
                memories.slice(0, 2).map((memory) => (
                  <MemoryCard key={memory.id} memory={memory} people={people} />
                ))
              )}
            </>
          )}

          {activeTab === 'people' && (
            <>
              <div style={styles.formCard}>
                <h2 style={{ marginTop: 0 }}>Add someone</h2>

                <input placeholder="Name" value={personName} onChange={(e) => setPersonName(e.target.value)} style={styles.input} />
                <input placeholder="Relationship" value={personType} onChange={(e) => setPersonType(e.target.value)} style={styles.input} />
                <input type="email" placeholder="Email" value={personEmail} onChange={(e) => setPersonEmail(e.target.value)} style={styles.input} />
                <input type="date" value={personBirthday} onChange={(e) => setPersonBirthday(e.target.value)} style={styles.input} />
<input
  type="file"
  accept="image/*"
  onChange={(e) => setPersonAvatar(e.target.files[0])}
  style={styles.input}
/>
                <button onClick={savePerson} style={styles.primaryButton}>
                  Save person
                </button>
              </div>

              <h3 style={styles.sectionTitle}>Your people</h3>

              {people.length === 0 ? (
                <p style={styles.empty}>No people added yet.</p>
              ) : (
                people.map((person) => (
                  <div key={person.id} style={styles.relationshipCard}>
                    <div style={styles.avatar}>{person.name[0]}</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0 }}>{person.name}</h3>
                      <p style={styles.muted}>{person.relationship_type || 'Relationship'}</p>
                      <p style={styles.muted}>{person.email || 'No email saved'}</p>
                      {person.birthday && <p style={styles.muted}>Birthday: {new Date(person.birthday).toLocaleDateString()}</p>}
                      <button onClick={() => deletePerson(person.id)} style={styles.deleteButton}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'memories' && (
            <>
              <div style={styles.formCard}>
                <h2 style={{ marginTop: 0 }}>Add memory</h2>

                <input placeholder="Memory title" value={memoryTitle} onChange={(e) => setMemoryTitle(e.target.value)} style={styles.input} />
                <textarea placeholder="Describe the memory..." value={memoryDescription} onChange={(e) => setMemoryDescription(e.target.value)} style={styles.textarea} />

                <select value={memoryPersonId} onChange={(e) => setMemoryPersonId(e.target.value)} style={styles.input}>
                  <option value="">Choose person</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>{person.name}</option>
                  ))}
                </select>

                <input type="date" value={memoryDate} onChange={(e) => setMemoryDate(e.target.value)} style={styles.input} />

                <button onClick={saveMemory} style={styles.primaryButton}>
                  Save memory
                </button>
              </div>

              <h3 style={styles.sectionTitle}>Memory timeline</h3>
              {memories.length === 0 ? (
                <p style={styles.empty}>No memories saved yet.</p>
              ) : (
                memories.map((memory) => <MemoryCard key={memory.id} memory={memory} people={people} />)
              )}
            </>
          )}

          {activeTab === 'compose' && (
            <div style={styles.formCard}>
              <h2 style={{ marginTop: 0 }}>Schedule a message</h2>

              <input placeholder="Recipient name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} style={styles.input} />
              <input type="email" placeholder="Recipient email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} style={styles.input} />
              <input placeholder="Email subject" value={subject} onChange={(e) => setSubject(e.target.value)} style={styles.input} />
              <textarea placeholder="Write your message..." value={message} onChange={(e) => setMessage(e.target.value)} style={styles.textarea} />
              <input type="datetime-local" value={deliverAt} onChange={(e) => setDeliverAt(e.target.value)} style={styles.input} />

              <button onClick={saveFutureMessage} style={styles.primaryButton}>
                Schedule message
              </button>
            </div>
          )}

          {activeTab === 'timeline' && (
            <>
              <h3 style={styles.sectionTitle}>Pending</h3>
              {pendingMessages.length === 0 ? (
                <p style={styles.empty}>No pending messages.</p>
              ) : (
                pendingMessages.map((item) => <MessageCard key={item.id} item={item} onDelete={deleteFutureMessage} />)
              )}

              <h3 style={styles.sectionTitle}>Delivered</h3>
              {deliveredMessages.length === 0 ? (
                <p style={styles.empty}>No delivered messages yet.</p>
              ) : (
                deliveredMessages.map((item) => <MessageCard key={item.id} item={item} onDelete={deleteFutureMessage} />)
              )}
            </>
          )}

          {activeTab === 'settings' && (
            <div style={styles.formCard}>
              <h2 style={{ marginTop: 0 }}>Account</h2>
              <button
  onClick={() => document.body.classList.toggle('dark-mode')}
  style={styles.primaryButton}
>
  Toggle light / dark mode
</button>
              <p style={styles.muted}>{session.user.email}</p>
              <h3>Delivery</h3>
              <p style={styles.muted}>Email delivery is active. WhatsApp and mobile notifications can be added later.</p>
              <button onClick={signOut} style={styles.primaryButton}>Sign out</button>
            </div>
          )}
        </section>

        <nav style={styles.nav}>
          <NavButton label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavButton label="People" active={activeTab === 'people'} onClick={() => setActiveTab('people')} />
          <NavButton label="Memories" active={activeTab === 'memories'} onClick={() => setActiveTab('memories')} />
          <NavButton label="Write" active={activeTab === 'compose'} onClick={() => setActiveTab('compose')} />
          <NavButton label="Timeline" active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} />
          <NavButton label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>
      </div>
    </main>
  )
}

function MessageCard({ item, onDelete }) {
  return (
    <div style={styles.messageCard}>
      <div style={styles.cardTop}>
        <div>
          <p style={styles.cardLabel}>{item.delivered ? 'Delivered' : 'Scheduled'}</p>
          <h3 style={{ margin: 0 }}>{item.subject || 'No subject'}</h3>
        </div>
        <span style={styles.status}>{item.delivered ? 'Sent' : 'Pending'}</span>
      </div>
      <p style={styles.muted}>To: {item.recipient_name} — {item.recipient_email}</p>
      <p style={styles.messageText}>{item.message}</p>
      <small style={styles.muted}>{new Date(item.deliver_at).toLocaleString()}</small>
      <button onClick={() => onDelete(item.id)} style={styles.deleteButton}>Delete</button>
    </div>
  )
}

function MemoryCard({ memory, people }) {
  const person = people.find((p) => p.id === memory.person_id)

  return (
    <div style={styles.messageCard}>
      <p style={styles.cardLabel}>{person?.name || 'Unknown person'}</p>
      <h3 style={{ marginTop: 0 }}>{memory.title}</h3>
      <p style={styles.messageText}>{memory.description}</p>
      {memory.memory_date && <small style={styles.muted}>{new Date(memory.memory_date).toLocaleDateString()}</small>}
    </div>
  )
}

function NavButton({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ ...styles.navButton, background: active ? '#2b2b2b' : 'transparent', color: active ? 'white' : '#6e6259' }}>
      {label}
    </button>
  )
}

const styles = {
  authShell: { minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f8f4ee', padding: 24, fontFamily: 'Inter, sans-serif' },
  authCard: { width: '100%', maxWidth: 420, background: '#f8f4ee', padding: 32, borderRadius: 32, boxShadow: '0 20px 60px rgba(43,43,43,.08)' },
  appShell: { minHeight: '100vh', background: '#f8f4ee', display: 'grid', placeItems: 'center', padding: 16, fontFamily: 'Inter, sans-serif' },
  phone: { width: '100%', maxWidth: 430, height: '92vh', background: '#f8f4ee', borderRadius: 36, overflow: 'hidden', boxShadow: '0 30px 90px rgba(43,43,43,.14)', display: 'flex', flexDirection: 'column', position: 'relative' },
  header: { padding: '24px 22px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  content: { flex: 1, overflowY: 'auto', padding: '10px 22px 110px' },
  brand: { margin: 0, color: '#8d765f', fontWeight: 800, fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase' },
  pageTitle: { margin: '6px 0 0', fontSize: 38, letterSpacing: -2 },
  authTitle: { fontSize: 44, lineHeight: 1, letterSpacing: -2 },
  muted: { color: '#6e6259', lineHeight: 1.5 },
  input: { width: '100%', padding: 15, borderRadius: 18, border: '1px solid #e4d9ce', marginBottom: 12, background: '#fff', fontSize: 15, boxSizing: 'border-box' },
  textarea: { width: '100%', padding: 15, borderRadius: 18, border: '1px solid #e4d9ce', marginBottom: 12, background: '#fff', fontSize: 15, minHeight: 130, resize: 'vertical', boxSizing: 'border-box' },
  primaryButton: { width: '100%', padding: 15, borderRadius: 999, border: 'none', background: '#2b2b2b', color: '#111111', fontWeight: 800 },
  smallButton: { border: 'none', background: '#f3eee7', color: '#6e6259', padding: '10px 14px', borderRadius: 999, fontWeight: 700 },
  lightButton: { border: 'none', background: '#fffdf9', color: '#2b2b2b', padding: '12px 16px', borderRadius: 999, fontWeight: 800 },
  heroCard: { background: '#2b2b2b', color: '#111111', padding: 24, borderRadius: 30, marginBottom: 24 },
  heroTitle: { fontSize: 26, lineHeight: 1.1 },
  sectionTitle: { marginTop: 24, marginBottom: 12 },
  peopleRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  personCard: { background: '#f3eee7', padding: 14, borderRadius: 24, minHeight: 120 },
  avatar: { width: 42, height: 42, borderRadius: '50%', background: '#8daa91', color: '#111111', display: 'grid', placeItems: 'center', fontWeight: 900, marginBottom: 10 },
 avatarImage: {
  width: 42,
  height: 42,
  borderRadius: '50%',
  objectFit: 'cover',
  marginBottom: 10,
},
  relationshipCard: { background: '#f3eee7', borderRadius: 26, padding: 18, display: 'flex', gap: 14, marginBottom: 12 },
  formCard: { background: '#f3eee7', padding: 20, borderRadius: 28 },
  messageCard: { background: '#fff', padding: 20, borderRadius: 26, marginBottom: 14, boxShadow: '0 10px 28px rgba(43,43,43,.05)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' },
  cardLabel: { margin: '0 0 6px', color: '#8d765f', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em' },
  status: { background: '#f3eee7', padding: '8px 10px', borderRadius: 999, fontSize: 12, color: '#6e6259' },
  messageText: { fontSize: 16, lineHeight: 1.6 },
  deleteButton: { marginTop: 12, border: 'none', background: '#f3eee7', padding: '10px 14px', borderRadius: 999 },
  empty: { color: '#8d765f', background: '#f3eee7', padding: 18, borderRadius: 22 },
  nav: { position: 'absolute', bottom: 16, left: 16, right: 16, background: 'rgba(255,253,249,.9)', backdropFilter: 'blur(16px)', border: '1px solid #eadfd4', borderRadius: 26, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', padding: 8, gap: 4 },
  navButton: { border: 'none', borderRadius: 999, padding: '10px 4px', fontSize: 10, fontWeight: 800 },
}
