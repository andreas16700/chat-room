<script lang="ts">
    import Tailwindcss from './Tailwindcss.svelte';
	import { Router, Route } from "svelte-routing";
    import ChatRoom from "./pages/chatRoom/chatRoom.svelte";
    import WelcomePage from "./pages/welcomePage/welcomePage.svelte";
    import Post from "./components/post.svelte";
    import CheckoutPage from "./pages/checkoutPage/checkoutPage.svelte";
    import Showcase from "./components/showcase.svelte";
    import CheckoutOnRefresh from "./pages/checkoutPage/checkoutOnRefresh.svelte"
    // import StaticRoom from "./pages/chatRoom/staticChatRoom.svelte";

	export let url = "";
    
</script>
<main>
    <Tailwindcss />
	<div class="content">
        <Router url="{url}" >
            <!-- <Route path="/staticRoom"let:params>
                <StaticRoom/>
            </Route> -->
            <Route path="/show"let:params>
                <!-- <div class="bg-purple-600 text-white text-4xl p-5">Tailwind is working!</div> -->
                <Showcase/>
            </Route>
			<Route path="/:accessCode/room"let:params>
                <!-- <span>access code: {params.accessCode} </span> -->
                <Post></Post> 
				 <ChatRoom/>
			</Route>
			<Route path="/:accessCode" let:params>
                <!-- <span>access code: {params.accessCode} </span> -->
				<WelcomePage/>
			</Route>
			<Route path="/:accessCode/checkout" let:params>
                <!-- <span>access code: {params.accessCode} </span> -->
				<CheckoutPage/>
			</Route>
            <Route path="/:accessCode/checkoutOnRefresh" let:params>
                <!-- <span>access code: {params.accessCode} </span> -->
                <CheckoutOnRefresh/>
            </Route>
        </Router>

    </div>

    <footer class="footer">
        <span>Discussion Room 2021; &copy; University of Zürich </span>
    </footer>
   
</main>

<style lang="scss">

    @import "vars";

    :global(a) {
        text-decoration: none;
    }
    :global(body) { 
        margin: 0;
        padding: 0;
    }

    footer {
        margin: 1rem;
    }
</style>
