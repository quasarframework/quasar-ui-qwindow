export default function useStyle() {

  function addClass(el, name) {
    const arr = el.className.split(' ')
    // make sure it's not already there
    if (arr.indexOf(name) === -1) {
      arr.push(name)
      el.className = arr.join(' ')
    }
  }

  function removeClass (el, name) {
    const arr = el.className.split(' ')
    const index = arr.indexOf(name)
    if (index !== -1) {
      arr.splice(index, 1)
      el.className = arr.join(' ')
    }
  }


  return {
    addClass,
    removeClass
  }

}
