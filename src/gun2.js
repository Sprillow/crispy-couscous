import { game } from 'melonjs/dist/melonjs.module'
import Gun from 'gun/gun'
import 'gun/lib/load.js'
import { removePlayer } from './js/createOrUpdateOtherPlayer'

// const RELAY_ADDRESS = 'http://localhost:8080/gun'
const RELAY_ADDRESS = 'https://hypha-gun-relay.herokuapp.com/gun'
const gun = Gun(RELAY_ADDRESS)

const LOCALSTORAGE_ME_KEY = 'ME_KEY'
const ARTISTAS_KEY = 'artistas'
const LOCATION_KEY = 'location'
const NAME_KEY = 'artistaName'
const IMAGE_KEY = 'artistaImage'

const artistas = gun.get(ARTISTAS_KEY)

// uncomment this to reset all the peoples
// artistas.map().once((data, id) => {
//   artistas.get(id).put(null)
// })

let IS_NEW_HERE = false

// check if I've visited before.
// re-use my id if so.
// if not, generate a random ID for myself
let myselfId = localStorage.getItem(LOCALSTORAGE_ME_KEY)

// a gunjs node
let myself

if (!myselfId) {
  IS_NEW_HERE = true
  console.log('first time here')
} else {
  console.log('second time here, this is my id: ', myselfId)
  setMyself(myselfId)
}

function setMyself(id) {
  myselfId = id
  localStorage.setItem(LOCALSTORAGE_ME_KEY, myselfId)
  myself = artistas.get(myselfId)
}

function subscribeToArtistas(callback) {
  artistas
    // all children properties (peers), but omit myself
    .map((data, id) => {
      return id === myselfId ? undefined : data
    })
    // once per artista, including those that are added over time
    .on((data, id) => {
      // data could have values, or be null
      // if data doesn't have LOCATION_KEY
      // that's our signal to remove this
      console.log('data', data, id)
      if (data && data[LOCATION_KEY]) {
        artistas.get(id).load((values) => {
          if (
            typeof values[LOCATION_KEY].y !== 'number' ||
            typeof values[LOCATION_KEY].x !== 'number'
          ) {
            // if location is null
            // clear user
            removePlayer(id)
            return
          }
          callback(id, values)
        })
      } else {
        // if `data` is null
        // clear user
        removePlayer(id)
      }
    })
}

export {
  IS_NEW_HERE,
  gun,
  myself,
  setMyself,
  artistas,
  myselfId,
  subscribeToArtistas,
  LOCALSTORAGE_ME_KEY,
  ARTISTAS_KEY,
  LOCATION_KEY,
  NAME_KEY,
  IMAGE_KEY,
}
