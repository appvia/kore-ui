import { Layout, Typography } from 'antd'
const { Footer } = Layout
const { Title } = Typography

import NewTeamForm from '../../components/forms/NewTeamForm'

const NewTeamPage = () => (
  <div>
    <Title>New Team</Title>
    <NewTeamForm />
    <Footer style={{textAlign: 'center', backgroundColor: '#fff'}}>
      <span>
        For more information read the <a href="#">Documentation</a>
      </span>
    </Footer>
  </div>
)

NewTeamPage.getInitialProps = async () => {
  return {
    title: 'Create new team'
  }
}

export default NewTeamPage
