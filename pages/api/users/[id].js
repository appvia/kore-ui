import { sampleUserData } from '../../../utils/sample-data'

export default (req, res) => {
  try {
    const { id } = req.query
    const selected = sampleUserData.find(data => data.id === Number(id))

    if (!selected) {
      throw new Error('Cannot find user')
    }

    res.status(200).json(selected)
  } catch (err) {
    res.status(404).json({ statusCode: 404, message: err.message })
  }
}
