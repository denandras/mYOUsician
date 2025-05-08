import { useState } from 'react'
import { supabase } from '../lib/supabase' // Adjust path based on your file structure

export default function Signup() {
  const [forename, setForename] = useState('')
  const [surname, setSurname] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Handle sign-up form submission
  const handleSignup = async (e) => {
    e.preventDefault()

    setLoading(true) // Set loading to true
    setError('') // Reset previous errors

    try {
      // Use Supabase auth to sign up the user
      const { user, error: signupError } = await supabase.auth.signUp({
        email: email,
        password: password, // Supabase automatically hashes the password for you
      })

      if (signupError) {
        setError(signupError.message)
      } else {
        // Insert additional user details (like forename and surname) into the 'users' table
        const { data, error: insertError } = await supabase
          .from('musicians') // Your table name
          .insert([
            {
              forename: forename,
              surname: surname,
              email: email,
              user_id: user.id, // Link the user to the authentication record
            },
          ])

        if (insertError) {
          setError(insertError.message)
        } else {
          console.log('User signed up and data inserted:', data)
          // Optionally redirect or notify user on success
        }
      }
    } catch (err) {
      console.error('Error during signup:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Forename"
          value={forename}
          onChange={(e) => setForename(e.target.value)}
        />
        <input
          type="text"
          placeholder="Surname"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      {error && <p>{error}</p>}
    </div>
  )
}
