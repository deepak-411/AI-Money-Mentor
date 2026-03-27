import MfXray from "@/components/tools/MfXray";

export default function MfXrayPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">MF Portfolio X-Ray</h1>
        <p className="text-muted-foreground">
            Upload your CAMS/KFintech statement for a complete portfolio analysis in seconds.
        </p>
      </div>
      <MfXray />
    </div>
  );
}
