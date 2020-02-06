import Link from 'next/link'
import { Breadcrumb, Icon } from 'antd'
import PropTypes from 'prop-types'

const KoreBreadcrumb = ({ items }) => {
  return (
    <Breadcrumb style={{ marginBottom: '16px' }}>
      <Breadcrumb.Item>
        <Link href="/">
          <a><Icon type="home" /></a>
        </Link>
      </Breadcrumb.Item>
      {items.map((item, idx) =>
        <Breadcrumb.Item key={idx}>
          {item.link ?
            <Link href={item.href} as={item.link || item.href}>
              <a>{item.text}</a>
            </Link> :
            item.text
          }
        </Breadcrumb.Item>
      )}
    </Breadcrumb>
  )
}

KoreBreadcrumb.propTypes = {
  items: PropTypes.array.isRequired
}

export default KoreBreadcrumb
