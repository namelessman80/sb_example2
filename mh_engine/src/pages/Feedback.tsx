import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { submitFeedback } from "@/lib/api";

const feedbackSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Enter a valid email"),
    message: z.string().min(1, "Message is required"),
});

type FeedbackForm = z.infer<typeof feedbackSchema>;

export default function Feedback() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FeedbackForm>({ resolver: zodResolver(feedbackSchema) });

    const onSubmit = async (data: FeedbackForm) => {
        try {
            await submitFeedback(data);
            toast.success("Thanks for your feedback!");
            reset();
        } catch {
            toast.error("Could not submit feedback. Please try again.");
        }
    };

    return (
        <div className="mx-auto max-w-lg space-y-6 px-4 py-10">
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
                <ArrowLeft className="size-4" /> Back
            </Link>

            <div>
                <h1 className="text-xl font-bold">Share feedback</h1>
                <p className="text-sm text-muted-foreground">
                    Tell us what worked, what didn't, or what you'd like to see next.
                </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" {...register("name")} />
                    {errors.name && (
                        <p className="text-xs text-destructive">{errors.name.message}</p>
                    )}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register("email")} />
                    {errors.email && (
                        <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" rows={5} {...register("message")} />
                    {errors.message && (
                        <p className="text-xs text-destructive">{errors.message.message}</p>
                    )}
                </div>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Spinner />}
                    Submit feedback
                </Button>
            </form>
        </div>
    );
}
