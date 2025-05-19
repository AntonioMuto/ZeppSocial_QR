import { BaseSideService } from '@zeppos/zml/base-side'
import { settingsLib } from '@zeppos/zml/base-side'

import { DEFAULT_SOCIAL_LIST } from './../utils/constants'

function getSocialList() {
  console.log(JSON.parse(settingsLib.getItem('socialList')))
  return settingsLib.getItem('socialList')
    ? JSON.parse(settingsLib.getItem('socialList'))
    : [...DEFAULT_SOCIAL_LIST]
}
AppSideService(
  BaseSideService({
    onInit() {},
    onRequest(req, res) {
      console.log('onRequest', req)
      if (req.method === 'GET_SOCIAL_LIST') {
        res(null, {
          result: getSocialList()
        })
      } else if (req.method === 'GET_QR_IMAGE') {
        const url = req.params?.url
        console.log('############ QR ########', url)
        if (!url || typeof url !== 'string' || url.trim() === '') {
          return res({ error: 'Invalid URL' })
        }
    
        QRCode.toDataURL(url, { errorCorrectionLevel: 'H' }, (err, dataUrl) => {
          if (err) {
            console.log('QR generation failed', err)
            return res({ error: 'QR generation failed' })
          }
          console.log('dataUrl', dataUrl)
          res(null, { image: dataUrl }) // <-- base64 image sent to watch
        })
    
      } else if (req.method === 'ADD') {
        // 这里补充一个
        const socialList = getSocialList()
        const newSocialList = [...socialList, String(Math.floor(Math.random() * 100))]
        settingsLib.setItem('socialList', JSON.stringify(newSocialList))

        res(null, {
          result: newTodoList
        })
      } else if (req.method === 'DELETE') {
        const { index } = req.params
        const todoList = getTodoList()
        const newTodoList = todoList.filter((_, i) => i !== index)
        settingsLib.setItem('todoList', JSON.stringify(newTodoList))

        res(null, {
          result: newTodoList
        })
      }
    },
    onSettingsChange({ key, newValue, oldValue }) {
      this.call({
        result: getSocialList()
      })
    },
    onRun() {},
    onDestroy() {}
  })
)
