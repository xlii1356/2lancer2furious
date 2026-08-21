<template>
	<div class="sidebar-page">
		<section class="sidebar-layout">
            <!-- Desktop Sidebar (Hidden on Mobile) -->
			<o-sidebar
			  id="sidebar"
			  position="static"
			  :animate="animate"
			  :mobile="mobile"
			  :expand-on-hover="expandOnHover"
			  :reduce="reduce"
			  open>
				<router-link class="clipped-bottom-right" to="/status">
					<img src="/icons/campaign.svg" />
					<span>Status</span>
				</router-link>
				<router-link class="clipped-bottom-right" to="/pilots">
					<img src="/icons/pilot.svg" />
					<span>Pilots</span>
				</router-link>
				<router-link class="clipped-bottom-right" to="/factions">
					<img src="/faction-logos/barony.svg" />
					<span>Factions</span>
				</router-link>
				<router-link class="clipped-bottom-right" to="/messages">
					<img src="/icons/conversation.svg" />
					<span>Messages</span>
				</router-link>
				<router-link class="clipped-bottom-right" to="/scans">
					<img src="/icons/mech.svg" />
					<span>Mech Scans</span>
				</router-link>
                <router-link class="clipped-bottom-right" to="/map">
                    <img src="/icons/orbital.svg" />
                    <span>Tactical Map</span>
                </router-link>
			</o-sidebar>
		</section>

        <!-- Mobile Bottom Navigation -->
        <nav class="mobile-bottom-nav">
            <router-link to="/status" active-class="active">
                <img src="/icons/orbital.svg" />
                <span>Status</span>
            </router-link>
            <router-link to="/pilots" active-class="active">
                <img src="/icons/pilot.svg" />
                <span>Pilots</span>
            </router-link>
            <router-link to="/factions" active-class="active">
                <img src="/faction-logos/barony.svg" />
                <span>Factions</span>
            </router-link>
            <router-link to="/messages" active-class="active">
                <img src="/icons/conversation.svg" />
                <span>Msgs</span>
            </router-link>
            <router-link to="/scans" active-class="active">
                <img src="/icons/mech.svg" />
                <span>Scans</span>
            </router-link>
            <router-link to="/map" active-class="active">
                <img src="/icons/orbital.svg" />
                <span>Map</span>
            </router-link>
        </nav>
	</div>
</template>

<script>
export default {
	props: {
		animate: {
			type: Boolean,
			required: true,
		},
	},
	data() {
		return {
			expandOnHover: false,
			mobile: "reduced",
			reduce: false,
		};
	}
};
</script>

<style scoped>
.sidebar-page,
.sidebar-layout {
	pointer-events: none;
	height: 150vh; /* Brute force: Ensure it exceeds viewport even with 0.8 scale */
	width: 100%;
}

#sidebar {
	pointer-events: auto;
    transition: transform 0.3s ease;
}

/* Mobile Bottom Nav Styles */
.mobile-bottom-nav {
    display: none; /* Hidden on desktop */
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 60px;
    background: var(--secondary-color, #161c1dcc);
    border-top: 2px solid var(--primary-color, #3269a8);
    z-index: 2000;
    justify-content: space-around;
    align-items: center;
    backdrop-filter: blur(5px);
    pointer-events: auto;
}

.mobile-bottom-nav a {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    color: var(--text-location, rgba(255, 255, 255, 0.87));
    font-size: 10px;
    font-family: "Roboto", sans-serif;
    text-transform: uppercase;
    width: 100%;
    height: 100%;
}

.mobile-bottom-nav a img {
    width: 20px;
    height: 20px;
    margin-bottom: 2px;
    opacity: 0.7;
    filter: invert(1);
}

.mobile-bottom-nav a.active {
    background: rgba(50, 105, 168, 0.2); /* var(--primary-color) with opacity */
    color: var(--primary-color, #3269a8);
    border-top: 2px solid var(--primary-color, #3269a8);
    margin-top: -2px; /* Offset border */
}

.mobile-bottom-nav a.active img {
    opacity: 1;
}

/* Mobile Breakpoint */
@media (max-width: 768px) {
    /* Hide Desktop Sidebar */
    .sidebar-layout {
        display: none !important;
    }

    /* Show Mobile Nav */
    .mobile-bottom-nav {
        display: flex;
    }
}
</style>
