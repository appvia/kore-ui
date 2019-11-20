import React from "react"
import App from "next/app"
import Head from "next/head"
import axios from 'axios'

import { Layout } from 'antd'
const { Header, Content } = Layout

import User from '../components/User'
import SiderMenu from '../components/SiderMenu'
import redirect from '../utils/redirect'
import { hub } from '../config'

class MyApp extends App {
  state = {
    siderCollapsed: false,
    menuTitleFontSize: '15px'
  }

  onSiderCollapse = siderCollapsed => {
    this.setState({
      siderCollapsed,
      menuTitleFontSize: this.state.siderCollapsed ? '15px' : '10px'
    });
  }

  static async getUser(req) {
    if (req) {
      const session = req.session
      return session && session.passport && session.passport.user
    }
    try {
      const result = await axios.get(`${hub.baseUrl}/user`)
      if (result.data.displayName) {
        return result.data
      }
      return false
    } catch (err) {
      throw new Error(err.message)
    }
  }

  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }
    if (pageProps.unrestrictedPage) {
      return { pageProps }
    }
    const user = await this.getUser(ctx.req)
    if (user) {
      return { pageProps, user }
    }
    return redirect(ctx.res, '/logout', true)
  }

  render() {
    const { Component, pageProps, user } = this.props
    const props = { ...pageProps, user }

    return (
      <div>
        <Head>
          <title>{props.title || 'Appvia Hub'}</title>
          <meta charSet="utf-8"/>
          <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
        </Head>
        <Layout style={{background: '#f0f2f5', height:'100vh'}}>
          <Header style={{backgroundColor: '#002140'}}>
            <div style={{color: '#FFF', float: 'left', fontSize: '18px', marginLeft: '-25px'}}>Appvia Hub</div>
            <User user={props.user}/>
          </Header>
          <Layout hasSider="true" style={{background: '#f0f2f5', height:'100vh'}}>
            <SiderMenu hide={props.hideSider || props.unrestrictedPage} isAdmin={props.user && props.user.isAdmin}/>
            <Content style={{background: '#fff', padding: 24, minHeight: 280}}>
              <Component {...props} />
            </Content>
          </Layout>
        </Layout>
      </div>
    )
  }
}

export default MyApp
