import React from 'react';
import {
	Popover,
	PopoverBody,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
    PopoverClose,
	PopoverFooter,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function FeedbackDemo() {
	const [rating, setRating] = React.useState(0);
	const [feedback, setFeedback] = React.useState('');

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" size="sm">
					Give Feedback
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80">
				<PopoverHeader>
					<PopoverTitle>Share Your Feedback</PopoverTitle>
					<PopoverDescription>
						Help us improve your experience
					</PopoverDescription>
				</PopoverHeader>
				<PopoverBody className="space-y-4">
					<div>
						<Label className="text-sm">How was your experience?</Label>
						<div className="mt-2 flex space-x-1">
							{[1, 2, 3, 4, 5].map((star) => (
								<button
									key={star}
									onClick={() => setRating(star)}
									className={`h-6 w-6 hover:bg-accent rounded-full text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
								>
									★
								</button>
							))}
						</div>
					</div>
					<div>
						<Label htmlFor="feedback-text" className="text-sm">
							Additional Comments
						</Label>
						<Textarea
							id="feedback-text"
							placeholder="Tell us more about your experience..."
							value={feedback}
							onChange={(e) => setFeedback(e.target.value)}
							className="mt-1 min-h-[80px] text-sm"
						/>
					</div>
				</PopoverBody>
				<PopoverFooter className="grid-cols-2">
					<PopoverClose asChild>
						<Button variant="outline" size="sm">
							Cancel
						</Button>
					</PopoverClose>
					<Button size="sm">Submit</Button>
				</PopoverFooter>
			</PopoverContent>
		</Popover>
	);
}
