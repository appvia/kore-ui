import Link from 'next/link'

const User = ({ user }) => {
  if (user) {
    return (
      <div style={{ color: '#FFF', float: 'right', marginRight: '-25px' }}>
        <span>{user.displayName}</span>
        <a href="/logout" style={{ marginLeft: '10px' }}>Logout</a>
      </div>
    )
  }
  return null
}

export default User