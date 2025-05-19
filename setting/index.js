import { gettext } from 'i18n'
import { DEFAULT_SOCIAL_LIST, SOCIAL_ICONS } from './../utils/constants'

AppSettingsPage({
  state: {
    socialList: [
      { name: 'Facebook', url: '' },
      { name: 'Instagram', url: ''},
      { name: 'Twitter', url: ''},
      { name: 'LinkedIn', url: ''},
      { name: 'YouTube', url: ''}
    ],
    props: {},
    editingIndex: null
  },

  setState(props) {
    this.state.props = props
    props.settingsStorage.cl
    const stored = props.settingsStorage.getItem('socialList')
    if (stored) {
      this.state.socialList = JSON.parse(stored)
    } else {
      this.state.socialList = DEFAULT_SOCIAL_LIST.map(item => ({
        name: item.name,
        url: '',
        default: true,
        color: item.color
      }))
    }
  },

  setItem() {
    // Salva TUTTI i social, anche quelli vuoti, per mantenere la lista completa
    this.state.props.settingsStorage.setItem('socialList', JSON.stringify(this.state.socialList))
    console.log('socialList', this.state.socialList)
  },
  addSocialList(val) {
    this.state.socialList = [...this.state.socialList, val]
    this.setItem()
  },
  deleteSocialList(index) {
    if(this.state.socialList[index].default){
      this.state.socialList[index].url = ''
    } else {
      this.state.socialList = this.state.socialList.filter((_, ind) => {
        return ind !== index
      })
    }
    this.setItem()
  },
  updateSocialUrl(index, url) {
    this.state.socialList[index].url = url.trim()
    this.state.editingIndex = null
    this.setItem()
    this.build(this.state.props)
  },

  build(props) {
    this.setState(props)
    const contentItems = this.state.socialList.map((social, index) => {
      const isEditing = this.state.editingIndex === index
      const isLinked = social.url && social.url.trim() !== ''
      const addBTN = View(
        {
          style: {
            fontSize: '12px',
            lineHeight: '30px',
            borderRadius: '30px',
            background: '#409EFF',
            color: 'white',
            textAlign: 'center',
            padding: '0 15px',
            width: '20%'
          }
        },
        [
          TextInput({
            label: isLinked ? gettext('editSocials') : gettext('addSocials'),
            onChange: (val) => {
               this.updateSocialUrl(index ,val)
            }
          })
        ]
      )

      const deleteBTN = 
          Button({
            style: {
              fontSize: '12px',
              lineHeight: '30px',
              borderRadius: '30px',
              background: 'red',
              color: 'white',
              textAlign: 'center',
              padding: '0 15px',
              width: '10%'
            }, 
          label: gettext('deleteSocials'),
          onClick: (val) => {
            this.deleteSocialList(index ,val)
          }
        })


      return View(
        {
          style: {
            padding: '10px',
            marginBottom: '12px',
            borderRadius: '8px',
            backgroundColor: isLinked ? social.color : '#f5f5f5',
            border: '1px solid #ccc',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            opacity: isLinked ? 1 : 0.5 // Grigio se disattivato
          },
          key: social.name
        },
        [
          // Icona social come immagine
          Image({
            src: SOCIAL_ICONS[social.name],
            style: {
              width: 24,
              height: 24,
              marginRight: 10
            }
          }),

          Text({
            value: social.name,
            style: {
              fontWeight: 'bold',
              fontSize: '14px',
              color: isLinked ? '#222' : '#888',
              flex: 1
            }
          }),

          isEditing &&
            TextInput({
              value: social.url,
              placeholder: 'https://yourprofile.com',
              onChange: (val) => {
                this.state.socialList[index].url = val
                setItem()
              }
            }),
            addBTN,
            isLinked && deleteBTN
        ]
      )
    })

    return View(
      { style: { padding: '16px' } },
      contentItems
    )
  }
})
