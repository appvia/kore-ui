import Link from 'next/link'
import { Breadcrumb, Icon } from 'antd'

const HubBreadcrumb = ({ itemText }) => {
  return (
    <Breadcrumb style={{ marginBottom: '16px' }}>
      <Breadcrumb.Item>
        <Link href="/">
          <a><Icon type="home" /></a>
        </Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>{itemText}</Breadcrumb.Item>
    </Breadcrumb>
  )
}

export default HubBreadcrumb
