import { useRouter } from 'next/router'
import Link from 'next/link'
import { Typography, Result, Button } from 'antd'

const { Paragraph, Text } = Typography

const InvalidTeamInvitationPage = () => {
  const router = useRouter()
  const link = router.query.link

  return (
    <div>
      <Result
        status="error"
        title="Invalid invitation link"
        subTitle={
          <div>
            <Paragraph>The link you used: <Text style={{ overflowWrap: 'break-word' }}><a href={link}>{link}</a></Text></Paragraph>
          </div>
        }
        extra={
          <Button type="primary">
            <Link href="/">
              <a>Go to dashboard</a>
            </Link>
          </Button>
        }
      />
    </div>
  )
}

InvalidTeamInvitationPage.staticProps = {
  title: 'Invalid team invitation'
}

export default InvalidTeamInvitationPage
