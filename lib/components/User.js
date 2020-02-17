import PropTypes from 'prop-types'
import { Dropdown, Tag, Typography, Menu, Icon } from 'antd'
const { Text } = Typography

const User = ({ user }) => {
  const menu = (
    <Menu>
      <Menu.Item key="logout">
        <a href="/logout"><Icon type="logout" style={{marginRight: '5px'}} /> Logout</a>
      </Menu.Item>
    </Menu>
  )
  const adminTag = user && user.isAdmin ? <Tag className="user-admin" color="green">admin</Tag> : null

  if (user) {
    return (
      <div className="user" style={{float: 'right', marginRight: '-25px'}}>
        <Dropdown overlay={menu}>
          <span className="submenu-title-wrapper" style={{marginTop: '20px'}}>
            {adminTag}
            <Icon type="user" style={{color: '#FFF', marginRight: '5px'}} />
            <Text className="user-displayName" style={{color: '#FFF', marginRight: '10px'}}>{user.displayName || user.name || user.id}</Text>
            <Icon type="down" style={{color: '#FFF'}} />
          </span>
        </Dropdown>
      </div>
    )
  }
  return null
}

User.propTypes = {
  user: PropTypes.object
}

export default User
