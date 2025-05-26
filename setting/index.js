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
      this.state.socialList = this.state.socialList.filter((_, ind) => ind !== index)
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
    if (trimmed.length > MAX_LENGTH) return

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
            background: '#409EFF',
            borderRadius: '6px',
            padding: '6px 10px',
            width: '100%',
            boxSizing: 'border-box',
            maxWidth: '40%'
          }
        },
        [
          TextInput({
            label: isLinked ? gettext('editSocials') : gettext('addSocials'),
            onChange: (val) => {
              this.updateSocialUrl(index, val)
            },
            style: {
              fontSize: 12,
              padding: '6px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              width: '100%',
              background: 'white',
              color: '#333'
            }
          })
        ]
      )

      const deleteBTN = Button({
        style: {
          fontSize: '12px',
          padding: '6px 10px',
          borderRadius: '6px',
          background: '#F56C6C',
          color: 'white',
          border: 'none',
          maxWidth: '30%'
        },
        label: gettext('deleteSocials'),
        onClick: () => {
          this.deleteSocialList(index)
        }
      })

      const editNameBTN = View(
        {
          style: {
            background: '#51d67b',
            borderRadius: '6px',
            padding: '4px 6px',
            width: '100%'
          }
        },
        [
          TextInput({
            label: gettext('editName'),
            onChange: (val) => {
              this.updateSocialName(index, val)
            },
            style: {
              fontSize: 12,
              padding: '6px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              width: '100%',
              background: 'white',
              color: '#333',
              maxWidth: '30%'
            }
          })
        ]
      )

      return View(
        {
          style: {
            padding: '12px',
            marginBottom: '12px',
            borderRadius: '8px',
            backgroundColor: '#fff',
            border: '1px solid #dcdfe6',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            opacity: isLinked ? 1 : 0.6
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
                marginBottom: '8px'
              }
            },
            [
              Image({
                src: social.default ? SOCIAL_ICONS[social.name] : SOCIAL_ICONS['default'],
                style: {
                  width: 24,
                  height: 24,
                  marginRight: 10
                }
              }),
              Text({
                style: {
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: '#303133'
                }
              }, social.name)
            ]
          ),
          isEditing && View(
            {
              style: {
                marginBottom: '8px'
              }
            },
            [
              TextInput({
                value: social.url,
                placeholder: 'https://yourprofile.com',
                onChange: (val) => {
                  this.state.socialList[index].url = val
                  this.setItem()
                },
                style: {
                  fontSize: 12,
                  padding: '6px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  width: '100%',
                  background: 'white',
                  color: '#333'
                }
              })
            ]
          ),

          View(
            {
              style: {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'space-between'
              }
            },
            [
              !social.default && View({ style: { width: '30%' } }, [editNameBTN]),
              View({ style: { flex: 1 } }, [addBTN]),
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
          height: '100vh',
          position: 'relative'
        }
      },
      [
        View(
          {
            style: {
              flex: 1,
              overflowY: 'auto',
              marginBottom: '60px'
            }
          },
          contentItems
        ),
        Button({
          label: gettext('addNewSocial'),
          onClick: () => {
            this.addSocialList({
              name: 'Nuovo Social',
              url: '',
              color: '0xba6804',
              default: false
            })
            this.build(this.state.props)
          },
          style: {
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            right: '16px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 'bold',
            borderRadius: '6px',
            background: '#67C23A',
            color: 'white',
            border: 'none',
            textAlign: 'center',
            zIndex: 1000,
            width: 'auto'
          }
        })
      ]
    )
  }
})
