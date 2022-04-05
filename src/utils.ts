import { EasingPreset, EASINGS } from './easings';

export class ScrollUtils {
	private container;
	private normalScrollElementIDs;
	private sections: string[];

	constructor(container: HTMLElement, normalScrollElementIDs: string[]) {
		this.container = container;
		this.normalScrollElementIDs = normalScrollElementIDs;
		this.sections = this.getContainerChildrenIDs();

		this.appendScrollbarStyles();
	}

	private appendScrollbarStyles() {
		const style = document.createElement('style');
		style.innerHTML = `
			.custom-snap--no-scrollbar {
				-ms-overflow-style: none;
				scrollbar-width: none;  
			}

			.custom-snap--no-scrollbar::webkit-scrollbar {
				display: none;
			}
		`;

		document.head.appendChild(style);
	}

	private getContainerChildrenIDs(): string[] {
		return Array.from(this.container.children).map((child) => child.id);
	}

	private preventDefault(e: any) {
		e = e || window.event;
		if (e.preventDefault) {
			e.preventDefault();
		}
		return (e.returnValue = false);
	}

	public showScrollbar(): void {
		document.body.classList.add('custom-snap--no-scrollbar');
	}

	public hideScrollbar(): void {
		document.body.classList.remove('custom-snap--no-scrollbar');
	}

	public isSectionNormal(index: number): boolean {
		return this.normalScrollElementIDs.includes(this.sections[index]);
	}

	public canScrollToBottom(currentSectionIndex: number): boolean {
		return currentSectionIndex < this.sections.length - 1;
	}

	public canScrollToTop(currentSectionIndex: number): boolean {
		return currentSectionIndex >= 1;
	}

	public getSectionByIndex(index: number): HTMLElement | null {
		return document.getElementById(this.sections[index]);
	}

	public disableScroll() {
		window.addEventListener('DOMMouseScroll', this.preventDefault, false);
		window.onwheel = this.preventDefault;
		window.ontouchmove = this.preventDefault;
	}

	public enableScroll() {
		window.removeEventListener(
			'DOMMouseScroll',
			this.preventDefault,
			false
		);
		window.onwheel = null;
		window.ontouchmove = null;
		return (document.onkeydown = null);
	}

	public scrollTo(to: number, duration = 1000, easing: EasingPreset) {
		const startingPosition = window.scrollY;
		const destinationPosition = to - startingPosition;

		const startTime = performance.now();

		return new Promise((resolve) => {
			const animateScroll = (timestamp: DOMHighResTimeStamp) => {
				const elapsedTime = timestamp - startTime;
				const animationProgress = EASINGS[easing](
					elapsedTime,
					startingPosition,
					destinationPosition,
					duration
				);

				document.documentElement.scrollTop = animationProgress;
				document.body.scrollTop = animationProgress;

				if (elapsedTime < duration) {
					requestAnimationFrame(animateScroll);
				} else {
					resolve(undefined);
				}
			};

			requestAnimationFrame(animateScroll);
		});
	}
}