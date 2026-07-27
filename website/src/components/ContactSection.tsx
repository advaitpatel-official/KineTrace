export function ContactSection() {
  return (
    <section id="contact" className="scroll-mt-24 px-6 pt-12 pb-8 md:pb-16 md:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="w-full text-foreground/75">
          Are you a researcher, clinician, or someone working with movement data? If you have questions or want to collaborate, please reach out, I would be happy and grateful to help.
        </p>

        <div className="mt-16 hairline-t">
          <div className="grid grid-cols-12 gap-4 py-6">
            <div className="col-span-12 md:col-span-4 font-display text-4xl md:text-5xl">Profiles</div>
            <div className="col-span-12 md:col-span-4 self-end text-sm">
              <a href="https://www.linkedin.com/in/advait-patel-a2a6323aa/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:underline">
                <i className="bi bi-linkedin" aria-hidden /> LinkedIn
              </a>
            </div>
            <div className="col-span-12 md:col-span-4 self-end text-sm">
              <a href="https://github.com/advaitpatel-official/KineTrace" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:underline">
                <i className="bi bi-github" aria-hidden /> GitHub
              </a>
            </div>
          </div>
          <div className="hairline-t grid grid-cols-12 gap-4 py-6">
            <div className="col-span-12 md:col-span-4 font-display text-4xl md:text-5xl">Contact</div>
            <div className="col-span-12 md:col-span-4 self-end text-sm">
              <a href="mailto:advait.patel@outlook.com" className="inline-flex items-center gap-2 hover:underline break-all">
                <i className="bi bi-envelope" aria-hidden /> advait.patel@outlook.com
              </a>
            </div>
            <div className="col-span-12 md:col-span-4 self-end text-sm">
              <a href="https://advaitpatel.netlify.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:underline">
                <i className="bi bi-box-arrow-up-right" aria-hidden /> Developer Website
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
