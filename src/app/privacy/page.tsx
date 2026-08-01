export const metadata = {
  title: "Privacy Policy — FlightCourse Academy",
  description: "How FlightCourse Academy handles your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <p className="label-instrument text-primary mb-3">Legal</p>
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
        Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </p>

      <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-2 font-semibold text-foreground">The short version</h2>
          <p>
            We store your progress (completed modules, quiz scores, XP, badges, game
            scores) locally in your browser using localStorage. We do not collect,
            store, or transmit personal data to any server. If you create an account,
            we store only your email address and authentication token — nothing else.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">What we store locally</h2>
          <ul className="ml-4 list-disc flex flex-col gap-1">
            <li>Module progress and quiz scores</li>
            <li>XP, badges, and license tier progress</li>
            <li>Flare Trainer attempts and landing history</li>
            <li>Radio Builder and Pattern Perfect scores</li>
            <li>Theme preference (dark/light)</li>
            <li>Game settings (sound, voice coach, etc.)</li>
          </ul>
          <p className="mt-2">
            This data never leaves your device. Clearing your browser data will
            reset all progress.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">Accounts</h2>
          <p>
            If you sign in with Google or GitHub, we receive your email address and
            a profile name from the OAuth provider. We do not receive or store your
            password. Authentication is handled by the provider — we never see your
            credentials.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">Analytics</h2>
          <p>
            We use Vercel Analytics, which collects anonymous, aggregated usage data
            (page views, country). It does not track individuals or store personal
            data.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">AI Copilot</h2>
          <p>
            If you use the AI Copilot chat, your questions are sent to Google&apos;s
            Gemini API or Groq API for processing. Their privacy policies apply to
            that data. We do not store your chat history on our servers.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">Contact</h2>
          <p>
            Questions about privacy? Email{" "}
            <span className="text-accent">privacy@flightcourse.academy</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
