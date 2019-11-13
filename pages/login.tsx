import * as React from 'react'
import { Layout as AntLayout, Button, Row, Col, Card } from 'antd'
import Head from 'next/head'

const { Header, Footer, Content } = AntLayout

const LoginPage: React.FunctionComponent = () => (
  <div>
    <Head>
      <title>Login</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <AntLayout>
      <Header>
        <div style={{ color: '#FFF', float: 'left', fontSize: '18px', marginLeft: '-25px' }}>Appvia Hub</div>
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
          <Row type="flex" justify="center">
            <Col span={8}>
              <Card title="Login" style={{ width: 300, textAlign: 'center' }}>
                <p>Login using the configured Identity Provider</p>
                <Button type="primary">
                  <a href="/login/github">Login with GitHub</a>
                </Button>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
      </Footer>
    </AntLayout>
  </div>
)

export default LoginPage
