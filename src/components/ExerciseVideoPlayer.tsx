import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ExerciseVideoPlayerProps = {
	title: string;
	// Either provide a direct storage path (preferred) or let the component look up by title in trainer_videos
	videoPath?: string | null;
	// Optional trainer name for header
	trainerName?: string | null;
	// Optional description for header
	description?: string | null;
	buttonClassName?: string;
};

const ONE_HOUR_SECONDS = 60 * 60;

export function ExerciseVideoPlayer(props: ExerciseVideoPlayerProps) {
	const { title, videoPath, trainerName, description, buttonClassName } = props;
	const [open, setOpen] = useState(false);
	const [signedUrl, setSignedUrl] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const headerTitle = useMemo(() => title, [title]);

	useEffect(() => {
		const fetchSignedUrl = async () => {
			if (!open) return;
			setLoading(true);
			try {
				let pathToSign: string | null = videoPath ?? null;

				// If no explicit path given, try to look up by title in trainer_videos
				if (!pathToSign) {
					const { data, error } = await supabase
						.from("trainer_videos")
						.select("video_url")
						.eq("title", headerTitle)
						.limit(1)
						.maybeSingle();

					if (error) {
						console.error("Video lookup error:", error);
						toast.error("Unable to load video");
						setSignedUrl(null);
						return;
					}
					pathToSign = data?.video_url ?? null;
				}

				if (!pathToSign) {
					toast.error("Video not available");
					setSignedUrl(null);
					return;
				}

				// If path already looks like a full https URL, use it directly
				if (/^https?:\/\//i.test(pathToSign)) {
					setSignedUrl(pathToSign);
					return;
				}

				// Otherwise, treat as storage file path in private bucket "trainer_videos"
				const { data: signed, error: signErr } = await supabase.storage
					.from("trainer_videos")
					.createSignedUrl(pathToSign, ONE_HOUR_SECONDS);

				if (signErr || !signed?.signedUrl) {
					console.error("Signed URL error:", signErr);
					toast.error("Unable to create secure video link");
					setSignedUrl(null);
					return;
				}

				setSignedUrl(signed.signedUrl);
			} finally {
				setLoading(false);
			}
		};

		fetchSignedUrl();
	}, [open, videoPath, headerTitle]);

	return (
		<>
			<Button
				variant="ghost"
				size="icon"
				className={buttonClassName}
				onClick={() => setOpen(true)}
				aria-label="Play video"
			>
				<Play className="w-4 h-4 text-[#FFD700]" />
			</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-w-4xl p-0 overflow-hidden">
					<DialogHeader className="p-6 pb-4">
						<DialogTitle className="text-2xl">{headerTitle}</DialogTitle>
						{trainerName && <p className="text-sm text-primary">by {trainerName}</p>}
					</DialogHeader>
					<div
						className="relative aspect-video bg-black select-none"
						onContextMenu={(e) => e.preventDefault()}
					>
						{signedUrl ? (
							<video
								src={signedUrl}
								controls
								controlsList="nodownload noplaybackrate"
								disablePictureInPicture
								className="w-full h-full"
								autoPlay
							/>
						) : (
							<div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
								{loading ? "Loading video..." : "Video unavailable"}
							</div>
						)}
					</div>
					{description && (
						<div className="p-6 pt-4">
							<p className="text-sm text-muted-foreground">{description}</p>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}

export default ExerciseVideoPlayer;



