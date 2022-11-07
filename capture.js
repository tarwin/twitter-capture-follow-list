const profiles = []

const capturedProfileUsers = []

let currentScroll = 0
let currentScrollTimes = 0

const textFromHtml = (html) => {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.innerText
}

const parseEmojis = (html) => {
  return html.replace(/(<img[^>]+>)/g, (m) => {
    const m2 = m.match(/<img.*?alt="(.*?)".*?>/)
    return m2[1]
  })
}

const capture = () => {
  const rows = document.querySelector('[aria-label^="Timeline:"]').children[0].children
  const out = []
  for (let i = 0; i < rows.length; i++) {
    let profile = {}
    
    try {
      const image = rows[i].querySelector('img')
      profile.imageUrl = image.src

      const anchors = rows[i].querySelectorAll('a')
      profile.name = textFromHtml(parseEmojis(anchors[1].innerHTML))
      profile.user = textFromHtml(parseEmojis(anchors[2].innerHTML))
      
      const divSpans = rows[i].querySelectorAll('div span')
      const descriptionHtml = divSpans[divSpans.length - 1].parentElement.innerHTML
      profile.description = textFromHtml(parseEmojis(descriptionHtml))
    } catch (e) {
      console.log('Failed on row', rows[i])
      continue
    }

    if (capturedProfileUsers.includes(profile.user)) {
      continue
    }
    capturedProfileUsers.push(profile.user)
    out.push(profile)
  }
  return out
}

const doScroll = () => {
  return new Promise((resolve, reject) => {
    currentScrollTimes++
    window.scrollTo(0, window.innerHeight * currentScrollTimes)
    if (window.scrollY === currentScroll) {
      resolve(false)
    } else {
      // wait for loading?
      setTimeout(() => {
        currentScroll = window.scrollY
        resolve(true)
      }, 1000)
    }
  })
}

const doTheLoop = async () => {
  let captures = await capture()
  profiles.push(...captures)
  console.log(`Captured ${profiles.length} profiles`)
    
  const scrolled = await doScroll()
  if (scrolled) {
    doTheLoop()
  } else {
    console.log('Done. Set to `window.CAPTURED_PROFILE`.')
    window.CAPTURED_PROFILE = profiles
  }
}
doTheLoop()
