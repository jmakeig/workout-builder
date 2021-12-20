export async function get() {

  // Do some magic here... ✨

  return {
    headers: { Location: '/success' },
    status: 302
  }
}