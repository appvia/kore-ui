import React from "react"
import App from "next/app"
import Head from "next/head"
import axios from 'axios'

import { Layout } from 'antd'
const { Header, Content } = Layout

import User from '../lib/components/User'
import SiderMenu from '../lib/components/SiderMenu'
import redirect from '../lib/utils/redirect'
import apiRequest from '../lib/utils/api-request'
import { hub, hubApi } from '../config'
import OrgService from '../server/services/org'

class MyApp extends App {
  state = {
    siderCollapsed: false
  }

  onSiderCollapse = siderCollapsed => {
    this.setState({ siderCollapsed })
  }

  static async getUserSession(req) {
    if (req) {
      const session = req.session
      const user = session && session.passport && session.passport.user
      if (user) {
        const orgService = new OrgService(hubApi)
        await orgService.refreshUser(user)
        return user
      }
      return false
    }
    try {
      const result = await axios.get(`${hub.baseUrl}/session/user`)
      return result.data
    } catch (err) {
      return false
    }
  }

  static async getTeams(req, userTeams) {
    try {
      const teams = await apiRequest(req, 'get', '/teams')
      return (teams.items || []).filter(t => userTeams.includes(t.metadata.name) && t.metadata.name !== hub.hubAdminTeamName)
    } catch (err) {
      console.error('Error retrieving hub teams', err.message)
      return []
    }
  }

  static async getInitialProps({ Component, ctx }) {
    let pageProps = ((Component.staticProps && typeof Component.staticProps === 'function') ? Component.staticProps(ctx) : Component.staticProps) || {}
    if (pageProps.unrestrictedPage) {
      return { pageProps }
    }
    const user = await MyApp.getUserSession(ctx.req)
    if (!user) {
      return redirect(ctx.res, '/logout', true)
    }
    if (Component.getInitialProps) {
      const initialProps = await Component.getInitialProps(ctx)
      pageProps = { ...pageProps, ...initialProps }
    }
    const teams = await MyApp.getTeams(ctx.req, user.teams)
    return { pageProps, user, teams }
  }

  render() {
    const { Component } = this.props
    const props = { ...this.props, ...this.props.pageProps }

    return (
      <div>
        <Head>
          <title>{props.title || 'Appvia Hub'}</title>
          <meta charSet="utf-8"/>
          <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
        </Head>
        <Layout style={{minHeight:'100vh'}}>
          <Header style={{backgroundColor: '#002140'}}>
            <div style={{color: '#FFF', float: 'left', fontSize: '18px', marginLeft: '-25px'}}>Appvia Hub</div>
            <User user={props.user}/>
          </Header>
          <Layout hasSider="true" style={{minHeight:'100vh'}}>
            <SiderMenu hide={props.hideSider || props.unrestrictedPage} isAdmin={props.user && props.user.isAdmin} teams={props.teams}/>
            <Content style={{background: '#fff', padding: 24, minHeight: 280}}>
              <Component {...this.props.pageProps} user={this.props.user} />
            </Content>
          </Layout>
        </Layout>
      </div>
    )
  }
}

export default MyApp
