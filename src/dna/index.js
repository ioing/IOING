// Immunity

const IMMUNITY = []

const DNA = (element, remove) => {
  if (remove) {
    let i = IMMUNITY.indexOf(element)
    if (i >= 0) {
      IMMUNITY.splice(i, 1)
    }
  } else {
    IMMUNITY.push(element)
  }
}

export default DNA
