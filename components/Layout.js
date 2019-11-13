import * as React from 'react'
import Link from 'next/link'
import Head from 'next/head'

import { Layout as AntLayout, Menu } from 'antd'

const { Header, Footer, Content } = AntLayout

const Layout = ({
  children,
  title = 'This is the default title',
  user
}) => (
  <div>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <AntLayout>
      <Header>
        <div style={{ color: '#FFF', float: 'left', fontSize: '18px', marginLeft: '-25px' }}>Appvia Hub ({user && user.displayName})</div>
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <Menu
          theme="light"
          mode="horizontal"
          style={{ lineHeight: '64px' }}
        >
          <Menu.Item key="1">
            <Link href="/">
              <a>Home</a>
            </Link>
          </Menu.Item>
          <Menu.Item key="2">
            <Link href="/about">
              <a>About</a>
            </Link>
          </Menu.Item>
          <Menu.Item key="3">
            <Link href="/users">
              <a>Users List</a>
            </Link>
          </Menu.Item>
        </Menu>
        <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
          {children}
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        <span>
          For more information read the <a href="#">Documentation</a>
        </span>
      </Footer>
    </AntLayout>
  </div>
)

export default Layout
