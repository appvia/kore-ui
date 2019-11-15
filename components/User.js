import * as React from 'react'
import { Tag, Typography, Menu, Icon } from 'antd'

const { Text, Paragraph } = Typography
const { SubMenu } = Menu

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
          <Paragraph style={{color: '#FFF'}}>
            <Menu mode="horizontal" theme="dark" style={{border: 'none', marginTop: '10px', marginRight: '-15px'}}>
              <SubMenu
                title={
                  <span className="submenu-title-wrapper">
                    <Icon type="user" style={{color: '#FFF'}} />
                    <Text style={{color: '#FFF', marginRight: '10px'}}>{user.displayName}</Text>
                    {user.isAdmin ? this.adminTag() : null}
                  </span>
                }
              >
                <Menu.Item key="logout">
                  <a href="/logout">Logout</a>
                </Menu.Item>
              </SubMenu>
            </Menu>
          </Paragraph>
        </div>
      )
    }
    return null
  }
}

export default User