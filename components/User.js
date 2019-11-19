import * as React from 'react'
import { Tag, Typography, Menu, Icon } from 'antd'

const { SubMenu } = Menu
const { Text } = Typography

class User extends React.Component {
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
    if (user) {
      return (
        <div style={{float: 'right', marginRight: '-25px'}}>
          <Menu mode="horizontal" theme="dark" style={{border: 'none', marginTop: '10px', marginRight: '-15px', backgroundColor: '#002140'}}>
            <SubMenu
              title={
                <span className="submenu-title-wrapper">
                  <Icon type="user" style={{color: '#FFF'}} />
                  <Text style={{color: '#FFF', marginRight: '10px'}}>{user.displayName}</Text>
                  {user.isAdmin ? this.adminTag() : null}
                </span>
              }
            >
              <Menu.Item key="logout" style={{color: '#FFF'}}>
                <a href="/logout" style={{color: '#FFF'}}>Logout</a>
              </Menu.Item>
            </SubMenu>
          </Menu>
        </div>
      )
    }
    return null
  }
}

export default User