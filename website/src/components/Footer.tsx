export function Footer() {
  return (
    <>
      <div className="px-6 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="hairline-t py-6 text-xs text-muted-foreground leading-relaxed space-y-3">
              <p className="font-semibold text-foreground">Important Note</p>
            <p>
              KineTrace is an experimental research tool, <strong>not</strong> a medical device. It is designed to give you insight into your movement health, but it cannot diagnose conditions, predict falls with certainty, or replace a professional medical evaluation. Always consult a qualified healthcare provider for medical advice.
            </p>
            <p>
              Any physical activities you perform while using KineTrace — such as walking, running, or climbing stairs — carry inherent risk. You are responsible for your own safety. KineTrace and its creators shall not be liable for any injuries or damages resulting from your use of the tool.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a href="/files/KineTrace_Terms_of_Service.pdf" download className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-foreground/80 hover:bg-foreground hover:text-background transition-colors"><i className="bi bi-file-text" /> Terms of Service</a>
              <a href="/files/KineTrace_Privacy_Policy.pdf" download className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-foreground/80 hover:bg-foreground hover:text-background transition-colors"><i className="bi bi-shield-check" /> Privacy Policy</a>
              <a href="/files/LICENSE.md" download className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-foreground/80 hover:bg-foreground hover:text-background transition-colors"><i className="bi bi-file-earmark-text" /> License</a>
            </div>
          </div>
        </div>
      </div>

      <footer className="px-6 pb-6 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-md text-xs text-muted-foreground">
              © KineTrace {new Date().getFullYear()}. Research prototype.
              <br />
              Built on blended UCI HAR + MotionSense datasets.
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:text-right">
              v0.1
            </div>
          </div>
          <svg
            aria-hiddenF
            viewBox="0 0 1000 220"
            preserveAspectRatio="xMidYMid meet"
            className="mt-8 block w-full select-none"
          >
            <text
              x="500"
              y="180"
              textAnchor="middle"
              textLength="1000"
              lengthAdjust="spacingAndGlyphs"
              fontFamily="Inter, sans-serif"
              fontWeight={600}
              fontSize={220}
              letterSpacing="-8"
              fill="currentColor"
            >
              kinetrace
            </text>
          </svg>
        </div>
      </footer>
    </>
  );
}