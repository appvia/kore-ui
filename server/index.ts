import next from 'next'
import express from 'express'

const port = parseInt(process.env.PORT || '3000', 10)
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()

  server.get('/a', (req: express.Request, res: express.Response) => {
    return app.render(req, res, '/about', req.query)
  })

  server.all('*', (req: express.Request, res: express.Response) => {
    return handle(req, res)
  })

  server.listen(port, (err: any) => {
    if (err) {
      throw err
    }
    console.log(`> Ready on http://localhost:${port}`)
  })
})
