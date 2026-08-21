<template>
	<div class="faction-modal">
		<div class="faction-header-container">
			<div class="section-header clipped-medium-backward-bio">
				<img src="/faction-logos/barony.svg" />
				<h1>KNOWN DETAILS</h1>
			</div>
			<div class="rhombus-back">&nbsp;</div>
		</div>
		<div class="faction" @click="handleMarkdownClick">
			<div class="name">
				<h1>{{ faction.location }} // {{ faction.time }}</h1>
				<h2>{{ faction.title }}</h2>
			</div>
			<vue-markdown-it :source="faction.content" class="markdown" />
		</div>
	</div>
</template>

<script>
import { VueMarkdownIt } from '@f3ve/vue-markdown-it';
import PilotModal from '@/components/modals/PilotModal.vue';
import PrimeModal from '@/components/modals/PrimeModal.vue';
import primeDataList from '@/assets/prime/prime.json';

export default {
	name: "FactionModal",
	components: {
		VueMarkdownIt,
	},
	props: {
		faction: {
			type: Object,
			required: true,
		},
        // We need pilots data to resolve pilot links
        pilots: {
            type: Array,
            required: false,
            default: () => [] 
        },
        // We need factions data if we want to resolve faction:// links to OTHER factions (though tricky in a modal)
        factions: {
            type: Array,
            required: false,
            default: () => []
        }
	},
    data() {
        return {
            primeData: primeDataList
        };
    },
    methods: {
        handleMarkdownClick(event) {
            const link = event.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            
            // --- HANDLE PILOT LINKS ---
            if (href && (href.startsWith('pilot://') || href.startsWith('pilots://'))) {
                event.preventDefault();
                let rawCallsign = href.replace(/^pilots?:\/\//, '');
                const callsign = decodeURIComponent(rawCallsign).toUpperCase();
                
                // We rely on the parent passing 'pilots' prop, OR we could try to inject/find it.
                // Assuming we update the caller to pass it.
                const pilot = this.pilots.find(p => p.callsign.toUpperCase() === callsign);
                
                if (pilot) {
                    this.$oruga.modal.open({
                        component: PilotModal,
                        custom: true,
                        trapFocus: true,
                        props: { pilot: pilot, talents: [], skills: [], frames: [] },
                        class: 'custom-modal',
                        width: 1920,
                    });
                }
            }

            // --- HANDLE MISSION LINKS (Navigate normally) ---
            else if (href && href.startsWith('mission://')) {
                event.preventDefault();
                const slug = decodeURIComponent(href.replace('mission://', ''));
                this.$router.push({ path: '/status', query: { mission: slug } });
                this.$emit('close'); // Close modal on navigation
            }

            // --- HANDLE PRIME LINKS ---
            else if (href && href.startsWith('prime://')) {
                event.preventDefault();
                const rawAlias = href.replace('prime://', '');
                const targetAlias = decodeURIComponent(rawAlias).toUpperCase();
                const primeEntry = this.primeData.find(p => p.alias.toUpperCase() === targetAlias);

                if (primeEntry) {
                    this.$oruga.modal.open({
                        component: PrimeModal,
                        custom: true,
                        trapFocus: true,
                        props: { prime: primeEntry },
                        class: 'custom-modal',
                        width: 1920,
                    });
                }
            }
            // --- HANDLE FACTION LINKS ---
            else if (href && href.startsWith('faction://')) {
                event.preventDefault();
                const titleRaw = href.replace('faction://', '');
                const title = decodeURIComponent(titleRaw);
                // Find existing faction from the passed faction list
                const targetFaction = this.factions.find(e => e.title.trim() === title.trim());

                if (targetFaction) {
                    // Open a new modal stacked on top for the linked faction
                     this.$oruga.modal.open({
                        component: this.$options, // Self-reference for recursion
                        custom: true,
                        trapFocus: true,
                        props: { 
                            faction: targetFaction,
                            pilots: this.pilots,
                            factions: this.factions
                        },
                        class: 'custom-modal',
                        width: 1920,
                    });
                }
            }
        }
    }
};
</script>

<style scoped>
/* Ensure the modal content wraps correctly on mobile */
.faction-modal {
    max-width: 100%;
    z-index: 2147483647 !important; /* Max z-index */
    position: relative;
    background-color: #161c1d !important; /* Force opaque background */
}

/* Force header scale down */
:deep(.section-header) {
    height: 40px !important;
    width: 100% !important;
    clip-path: none !important;
}
:deep(.section-header img) {
    height: 24px !important;
    width: 24px !important;
}
:deep(.section-header h1) {
    font-size: 1rem !important;
    line-height: 40px !important;
}
:deep(.rhombus-back) {
    display: none !important;
}

/* Override fixed widths that might be forcing the modal wide */
:deep(.clipped-medium-backward-bio) {
    width: 100% !important;
    max-width: 100% !important;
    clip-path: none !important; /* Optional: remove complex clip path if it messes up responsive width, or adjust */
}

/* Ensure the modal stays within bounds */
.faction-modal {
    width: 100%;
    max-width: 85vw; /* Explicitly constrain width relative to viewport */
    max-height: 85vh; /* Limit height to allow scrolling within view */
    display: flex; /* Flexbox for scrolling body */
    flex-direction: column;
    overflow: hidden; /* Prevent horizontal scroll, internal scroll on body */
    box-sizing: border-box;
    margin: 0 auto; /* Center it */
}

.faction-modal .faction {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    color: #eee;
    overflow-y: auto; /* Allow scroll if needed on container */
    flex: 1;
    min-height: 0;
}

.modal-card-body {
    padding: 20px;
    overflow-y: auto;
    color: #eee;
    flex: 1;
    min-height: 0;
}

.faction-modal .markdown {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
}

/* Use deep selector to ensure styles apply to elements INSIDE the markdown component */
/* Note: Using :deep() for Vue 3 compliance */
:deep(.markdown),
:deep(.markdown p),
:deep(.markdown div),
:deep(.markdown span),
:deep(.markdown h1),
:deep(.markdown h2),
:deep(.markdown h3),
:deep(.markdown h4),
:deep(.markdown li) {
    white-space: pre-wrap !important; /* Preserve line breaks but wrap text */
    word-break: break-word !important; /* Break long words if necessary */
    overflow-wrap: anywhere !important; /* Force break if line is too long */
    max-width: 100%;
    box-sizing: border-box;
}

/* Re-apply link styles since this component might be scoped differently or need explicit targetting */
:deep(.markdown a[href^="pilot://"]),
:deep(.markdown a[href^="pilots://"]) {
  color: #FFC107;
  font-weight: bold;
  text-decoration: none;
  border-bottom: 1px dotted #FFC107;
  transition: background 0.2s;
}
:deep(.markdown a[href^="pilot://"]:hover),
:deep(.markdown a[href^="pilots://"]:hover) {
  background-color: rgba(255, 193, 7, 0.2);
  cursor: pointer;
}

:deep(.markdown a[href^="mission://"]) {
  color: #3269a8;
  font-weight: bold;
  text-decoration: none;
  border-bottom: 1px dotted #3269a8;
}
:deep(.markdown a[href^="mission://"]:hover) {
  background-color: rgba(50, 105, 168, 0.2);
  cursor: pointer;
}

:deep(.markdown a[href^="faction://"]) {
  color: #bd93f9; 
  font-weight: bold;
  text-decoration: none;
  border-bottom: 1px dotted #bd93f9;
}
:deep(.markdown a[href^="faction://"]:hover) {
  background-color: rgba(189, 147, 249, 0.2);
  cursor: pointer;
}

:deep(.markdown a[href^="prime://"]) {
  color: #ff5555; 
  font-weight: bold;
  text-decoration: none;
  border-bottom: 1px dotted #ff5555;
}
:deep(.markdown a[href^="prime://"]:hover) {
  background-color: rgba(255, 85, 85, 0.2);
  cursor: pointer;
}
</style>
