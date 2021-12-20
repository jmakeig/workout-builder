export async function get() {
	return {
		headers: { Location: "/config" },
		status: 302
	};
}
