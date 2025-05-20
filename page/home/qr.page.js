import * as hmUI from '@zos/ui'
import { log as Logger } from '@zos/utils'
import { push } from '@zos/router'
import { getDeviceInfo } from '@zos/device'

const logger = Logger.getLogger('qr-page')

Page({
    onInit(param) {
        console.log('onInit param raw:', param)
        // Se param è una stringa, prova a fare il parse JSON
        let element = param
        if (typeof param === 'string') {
            try {
                element = JSON.parse(param)
            } catch (e) {
                console.error('Errore parsing param:', e)
            }
        }
        console.log('element dopo parse:', element)
        console.log('url:', element?.url)

        const { width, height } = getDeviceInfo()
        const size = 240 // larghezza/altezza del QR code
        const x = (width - size) / 2
        const y = (height - size) / 2


        logger.debug('element', element)
        hmUI.createWidget(hmUI.widget.FILL_RECT, {
            x: 0,
            y: 0,
            w: width,
            h: height,
            color: element.color
        })

        hmUI.createWidget(hmUI.widget.TEXT, {
            x: x,
            y: y - 30 - 10,      // 30 è l'altezza testo, 10 il margine sopra il QR
            w: size,
            h: 30,
            text: element.title,
            color: 0xFFFFFF,
            align_h: hmUI.align.CENTER,
            text_size: 20
        })


        hmUI.createWidget(hmUI.widget.QRCODE, {
            x,
            y,
            w: size,
            h: size,
            content: element.url
        })
    }
})

function retrieveColor(color) {
    switch (color) {
        case "0x3b5998":
            return 0x3b5998
        case "0xE1306C":
            return 0xE1306C
        case "0x1DA1F2":
            return 0x1DA1F2
        case "0x0077B5":
            return 0x0077B5
        case "0xFF0000":
            return 0xFF0000
        default:
            return 0x3b5998
    }
}
