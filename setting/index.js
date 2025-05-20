import { gettext } from 'i18n'
import { DEFAULT_SOCIAL_LIST, SOCIAL_ICONS } from './../utils/constants'

AppSettingsPage({
  state: {
    socialList: [
      { name: 'Facebook', url: '' },
      { name: 'Instagram', url: '' },
      { name: 'Twitter', url: '' },
      { name: 'LinkedIn', url: '' },
      { name: 'YouTube', url: '' }
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
    if (this.state.socialList[index].default) {
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
  updateSocialName(index, name) {
    const trimmed = name.trim()
    const MAX_LENGTH = 20
  
    if (trimmed.length > MAX_LENGTH) {
      return
    }
  
    this.state.socialList[index].name = trimmed
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
            fontSize: '11px',
            lineHeight: '30px',
            borderRadius: '30px',
            background: '#409EFF',
            color: 'white',
            textAlign: 'center',
            padding: '0 15px',
            width: '100%'
          }
        },
        [
          TextInput({
            label: isLinked ? gettext('editSocials') : gettext('addSocials'),
            onChange: (val) => {
              this.updateSocialUrl(index, val)
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
            this.deleteSocialList(index, val)
          }
        })

      const editNameBTN =View(
        {
          style: {
            fontSize: '11px',
            lineHeight: '30px',
            borderRadius: '30px',
            background: '#409EFF',
            color: 'white',
            textAlign: 'center',
            padding: '0 15px',
            width: '100%'
          }
        },
        [
          TextInput({
            label: gettext('editName'),
            onChange: (val) => {
              this.updateSocialName(index, val)
            }
          })
        ]
      )

      

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
            justifyContent: 'space-between',
            opacity: isLinked ? 1 : 0.5
          },
          key: social.name
        },
        [
          View(
            {
              style: {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '8px'
              }
            },
            [
              Image({
                src: social.default ? SOCIAL_ICONS[social.name] : SOCIAL_ICONS['default'],
                style: {
                  width: 24,
                  height: 24,
                  marginRight: 16
                }
              }),
              Text({
                style: {
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: 'black',
                  marginBottom: isEditing ? 6 : 0
                }
              },
                social.name
              ),
              !social.default && editNameBTN
            ]
          ),
          // Icona a sinistra

          // Nome + input (centrale)
          View(
            {
              style: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                marginRight: 16
              }
            },
            [
              isEditing &&
              TextInput({
                value: social.url,
                placeholder: 'https://yourprofile.com',
                onChange: (val) => {
                  this.state.socialList[index].url = val
                  this.setItem()
                },
                style: {
                  fontSize: 12,
                  padding: '4px 8px',
                  borderRadius: 6
                }
              })
            ]
          ),

          // Pulsanti allineati a destra
          View(
            {
              style: {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '8px'
              }
            },
            [
              addBTN,
              (isLinked || !social.default) && deleteBTN
            ]
          )
        ]
      )


    })

    return View(
      {
        style: {
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }
      },
      [
        View(
          {
            style: {
              flex: 1,
              overflowY: 'auto'
            }
          },
          contentItems
        ),
        Button({
          label: gettext('addNewSocial'), // oppure direttamente "Aggiungi nuovo social"
          onClick: () => {
            this.addSocialList({
              name: 'Nuovo Social',
              url: '',
              color: '#66ff00',
              default: false
            })
            this.build(this.state.props)
          },
          style: {
            marginTop: '16px',
            padding: '10px 20px',
            fontSize: '14px',
            borderRadius: '30px',
            background: '#67C23A',
            color: 'white',
            textAlign: 'center',
            width: '100%'
          }
        })
      ]
    )

  }
})
