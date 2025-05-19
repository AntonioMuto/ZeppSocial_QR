import * as hmUI from '@zos/ui'
import { getText } from '@zos/i18n'
import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from '@zos/device'
import { log as Logger } from '@zos/utils'

import { BasePage } from '@zeppos/zml/base-page'
import {
  TITLE_TEXT_STYLE,
  TIPS_TEXT_STYLE,
  SCROLL_LIST,
  ADD_BUTTON
} from 'zosLoader:./index.page.[pf].layout.js'
import { readFileSync, writeFileSync } from './../../utils/fs'
import { getScrollListDataConfig } from './../../utils/index'

const logger = Logger.getLogger('todo-list-page')

Page(
  BasePage({
    state: {
      scrollList: null,
      tipText: null,
      refreshText: null,
      addButton: null,
      dataList: readFileSync()
    },
    onInit() {
      logger.debug('page onInit invoked')
      this.getSocialList()
    },
    build() {
      logger.debug('page build invoked')

      if (getDeviceInfo().screenShape !== SCREEN_SHAPE_SQUARE) {
        this.state.title = hmUI.createWidget(hmUI.widget.TEXT, {
          ...TITLE_TEXT_STYLE
        })
      }

      this.createAndUpdateList(false)
    },
    onDestroy() {
      logger.debug('page onDestroy invoked')
      writeFileSync(this.state.dataList, false)
    },
    onCall(req) {
      const dataList = req.result.map((i) => ({ name: i, img_src: 'delete.png' }))
      logger.log('call dataList', dataList)
      this.refreshAndUpdate(dataList)
    },
    getSocialList() {
      this.request({
        method: 'GET_SOCIAL_LIST'
      })
        .then(({ result }) => {
          this.state.dataList = result.map((d) => ({ name: d.name, url: d.url, img_src: 'delete.png' }))
          logger.debug('this.state.dataList', this.state.dataList)
          this.createAndUpdateList()
        })
        .catch((res) => {
          this.createAndUpdateList()
        })
    },
    deleteSocialItem(index) {
      this.request({
        method: 'DELETE',
        params: { index }
      })
        .then(({ result }) => {
          this.state.scrollList.setProperty(hmUI.prop.DELETE_ITEM, { index: index })
          this.state.dataList.splice(index, 1)
          hmUI.showToast({
            text: getText('deleteSuccess')
          })
        })
        .catch((res) => {
          hmUI.showToast({
            text: getText('deleteFailure')
          })
        })
    },
    changeUI(showEmpty) {
      const { dataList } = this.state

      if (showEmpty) {
        if (dataList.length === 0) {
          !this.state.tipText &&
            (this.state.tipText = hmUI.createWidget(hmUI.widget.TEXT, {
              ...TIPS_TEXT_STYLE
            }))
        }
        const isTip = dataList.length === 0

        this.state.refreshText && this.state.refreshText.setProperty(hmUI.prop.VISIBLE, false)
        this.state.tipText && this.state.tipText.setProperty(hmUI.prop.VISIBLE, isTip)
        this.state.scrollList && this.state.scrollList.setProperty(hmUI.prop.VISIBLE, !isTip)
      } else {
        !this.state.refreshText &&
          (this.state.refreshText = hmUI.createWidget(hmUI.widget.TEXT, {
            ...TIPS_TEXT_STYLE,
            text: ' '
          }))

        this.state.tipText && this.state.tipText.setProperty(hmUI.prop.VISIBLE, false)
        this.state.refreshText.setProperty(hmUI.prop.VISIBLE, true)
        this.state.scrollList && this.state.scrollList.setProperty(hmUI.prop.VISIBLE, false)
      }
    },
    createAndUpdateList(showEmpty = true) {
      const _scrollListItemClick = (list, index, key) => {
        if (key === 'img_src') {
          this.deleteTodoItem(index)
        } else {
          const item = this.state.dataList[index]
          // Recupera l'url del social cliccato
          if (item && item.url) {
            this.showQRCode(item.url)
          } else {
            hmUI.showToast({ text: getText('noUrlAvailable') })
          }
        }
      }
      const { scrollList, dataList } = this.state
      this.changeUI(showEmpty)
      const dataTypeConfig = getScrollListDataConfig(
        dataList.length === 0 ? -1 : 0,
        dataList.length
      )
      if (scrollList) {
        scrollList.setProperty(hmUI.prop.UPDATE_DATA, {
          data_array: dataList,
          data_count: dataList.length,
          data_type_config: [{ start: 0, end: dataList.length, type_id: 2 }],
          data_type_config_count: dataTypeConfig.length,
          on_page: 1
        })
      } else {
        this.state.scrollList = hmUI.createWidget(hmUI.widget.SCROLL_LIST, {
          ...(SCROLL_LIST || {}),
          data_array: dataList,
          data_count: dataList.length,
          data_type_config: dataTypeConfig,
          data_type_config_count: dataTypeConfig.length,
          item_enable_horizon_drag: true,
          item_drag_max_distance: -120,
          on_page: 1,
          item_click_func: _scrollListItemClick
        })
      }
    },
    refreshAndUpdate(dataList = []) {
      this.state.dataList = []
      this.createAndUpdateList(false)

      setTimeout(() => {
        this.state.dataList = dataList
        this.createAndUpdateList()
      }, 20)
    },
    showQRCode(url) {
      if (this.state.qrCodeWidget) {
        this.state.qrCodeWidget.setProperty(hmUI.prop.VISIBLE, true)
        this.state.qrCodeWidget.setProperty(hmUI.prop.URL, url)
      } else {
        this.state.qrCodeWidget = hmUI.createWidget(hmUI.widget.QR_CODE, {
          x: 20,
          y: 50,
          size: 200,
          url: url,
          visible: true,
          onClick: () => {
            this.state.qrCodeWidget.setProperty(hmUI.prop.VISIBLE, false)
          }
        })
      }
    }
  })
)
