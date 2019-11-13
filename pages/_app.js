import React from "react";
import App from "next/app";
import Link from 'next/link'
import Head from "next/head";

import { Layout as AntLayout, Menu } from 'antd'
const { Header, Footer, Content } = AntLayout

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }
    console.log('ctx.req.session', ctx.req && ctx.req.session)
    if (ctx.req && ctx.req.session && ctx.req.session.passport) {
      pageProps.user = ctx.req.session.passport.user;
    }
    return { pageProps };
  }

  constructor(props) {
    console.log('constructor', props)
    super(props);
    // this.state = {
    //   user: props.pageProps.user
    // };
  }

  render() {
    console.log('App.render.props', this.props)
    const {Component, pageProps} = this.props;

    const props = {
      ...pageProps
      // user: this.state.user,
    };

    return (
      <div>
        <Head>
          <title>{props.title || 'Title'}</title>
          <meta charSet="utf-8"/>
          <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
        </Head>
        <AntLayout>
          <Header>
            <div style={{color: '#FFF', float: 'left', fontSize: '18px', marginLeft: '-25px'}}>Appvia Hub ()</div>
          </Header>
          <Content style={{padding: '0 50px'}}>
            <Menu
              theme="light"
              mode="horizontal"
              style={{lineHeight: '64px'}}
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
            <div style={{background: '#fff', padding: 24, minHeight: 280}}>
              <Component {...props} />
            </div>
          </Content>
          <Footer style={{textAlign: 'center'}}>
            <span>
              For more information read the <a href="#">Documentation</a>
            </span>
          </Footer>
        </AntLayout>
      </div>
    )
  }
}

export default MyApp
