import { Request, Response, NextFunction } from 'express'
import { Router } from 'express'
import app from './next'
import { hubApi } from '../config'
import { AxiosResponse } from 'axios'
const axios = require('axios').default;

import passport from 'passport'
const router = Router()

router.get('/auth', async (req: Request, res: Response) => {
  const url: string = `${hubApi.url}/auth`
  try {
    const result: AxiosResponse = await axios.get(url)
    console.log('result', result.data);
  } catch (err) {
    throw new Error(err.message)
  }

  return app.render(req, res, '/about', req.query)
})

router.get('/user', (req: Request, res: Response) => {
  console.log('/user req.sessionID', req.sessionID)
  console.log('/user req.isAuthenticated()', req.isAuthenticated())
  const user = req.session!.passport && req.session!.passport!.user
  console.log('/user user', user)
  res.json(user || {})
})

router.get('/login/github', passport.authenticate('github'));

router.get('/login/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req: Request, res: Response) => {
  console.log('/login/github/callback req.sessionID', req.sessionID)
  res.redirect('/')
})

router.get('/logout', (req: Request, res: Response, next: NextFunction) => {
  req.session!.destroy((err) => {
    if(err) return next(err)
    req.logout()
    res.redirect('/login')
  })
})

export default router
