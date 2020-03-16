import PropTypes from 'prop-types'
import { Popover, Icon, Typography, Tag } from 'antd'
const { Text, Paragraph } = Typography

import * as helpers from '../utils/ui-helpers'

const ResourceVerificationStatus = ({ resourceStatus, style }) => {
  if (!resourceStatus) {
    return null
  }

  const conditions = resourceStatus.conditions
  const status = resourceStatus.status || 'Pending'

  const verifiedTag = (
    <Tag style={style} color={helpers.statusColorMap[status] || 'red'}>
      {helpers.inProgressStatusList.includes(status) ? <Icon type="loading" /> : null} {helpers.verifiedStatusMessageMap[status]}
    </Tag>
  )

  if (conditions && conditions.length) {
    return (
      <Popover placement="left" content={
        conditions.map((c, idx) =>
          <Paragraph key={idx} style={{ marginBottom: '0', padding: '5px' }}>
            <Text strong>{c.message}</Text>
            <br/>
            <Text>{c.detail}</Text>
          </Paragraph>
        )
      }>
        {verifiedTag}
      </Popover>
    )
  }

  return verifiedTag
}

ResourceVerificationStatus.propTypes = {
  resourceStatus: PropTypes.object,
  style: PropTypes.object
}

export default ResourceVerificationStatus
