import * as React from 'react'
import PropTypes from 'prop-types'
import { Dropdown, Tag, Typography, Menu, Icon } from 'antd'
const { Text } = Typography

class User extends React.Component {
  static propTypes = {
    user: PropTypes.object
  }

  adminTag() {
    if (this.props.user.isAdmin) {
      return (
        <Tag color="green">admin</Tag>
      )
    }
    return null
  }

  render() {
    const user = this.props.user
    const menu = (
      <Menu>
        <Menu.Item key="logout">
          <a href="/logout"><Icon type="logout" style={{marginRight: '5px'}} /> Logout</a>
        </Menu.Item>
      </Menu>
    )
    if (user) {
      return (
        <div style={{float: 'right', marginRight: '-25px'}}>
          <Dropdown overlay={menu}>
            <span className="submenu-title-wrapper" style={{marginTop: '20px'}}>
              {user.isAdmin ? this.adminTag() : null}
              <Icon type="user" style={{color: '#FFF', marginRight: '5px'}} />
              <Text style={{color: '#FFF', marginRight: '10px'}}>{user.displayName}</Text>
              <Icon type="down" style={{color: '#FFF'}} />
            </span>
          </Dropdown>
        </div>
      )
    }
    return null
  }
}

export default User