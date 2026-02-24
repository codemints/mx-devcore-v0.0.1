const createThreshold = (threshold) => {
  let previous = null

  return (value) => {
    const wasAbove = previous !== null ? previous >= threshold : null
    const isAbove = value >= threshold
    const hasSwitched = wasAbove !== null && wasAbove !== isAbove

    previous = value

    return {
      hasSwitched,
      isAbove,
      direction: hasSwitched ? (isAbove ? 'up' : 'down') : null,
    }
  }
}