function onClickTop () {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

function bindGoTopBtn () {
  const btn = document.querySelector('#go-top')
  btn.addEventListener('click', onClickTop)
}

(() => {
  bindGoTopBtn()
})()