# Zapier SOAP Note Workflow

## Compliance First

If the transcript contains protected health information, do not run it through
Zapier or an AI vendor unless every service in the chain is approved for that
use and covered by the needed agreements, including a BAA where required.

The output from this workflow must be treated as a draft. Diagnosis and code
suggestions are not final clinical or billing determinations.

## Recommended Zap Shape

```text
1. PLAUD: Transcript & Summary Ready
2. Google Drive: Upload/Create File in PLAUD Incoming Transcripts
3. ChatGPT/OpenAI or AI by Zapier: Generate structured SOAP note JSON
4. Formatter by Zapier: Parse JSON if needed
5. Google Docs: Create Document from mapped fields
6. Google Drive: Save document in formatted notes folder
```

If you want the Drive folder to contain only raw source transcripts, place the
AI step after the transcript upload. If you want Drive to contain only final
SOAP notes, place the AI step before the Google Docs/Drive creation step.

## Do You Need A JSON File?

Usually yes, but specifically you need a JSON Schema, not just example JSON.
Use:

```text
schemas/soap-note.schema.json
```

Use it wherever Zapier asks for structured output, response format, or a JSON
schema URL. If Zapier requires a public schema URL, host this file from GitHub
using the raw file URL.

## AI Prompt

Use this as the AI instruction:

```text
You are creating a draft SOAP note from a healthcare encounter transcript.

Return only valid JSON matching the provided SOAP Note AI Output schema.

Rules:
- Do not invent facts.
- If information is missing, write "unknown" or list it in quality_checks.missing_key_details.
- Separate subjective patient-reported information from objective observations.
- Suggested diagnosis and code fields are suggestions only.
- Include only codes that are reasonably supported by the transcript.
- Use low confidence when evidence is incomplete.
- Every coding_suggestions item must have review_required = true.
- Every diagnostic_considerations item must have review_required = true.
- Include this exact review_notice:
  "AI-generated draft. Clinical, diagnostic, and coding suggestions require review by a qualified clinician or coder before use."

Transcript:
{{transcript_text_from_PLAUD}}
```

## Fields To Map Into Google Docs

Map these fields into your Google Doc template:

```text
metadata.patient_name
metadata.encounter_date
metadata.clinician_name
soap_note.subjective
soap_note.objective
soap_note.assessment
soap_note.plan
coding_suggestions
diagnostic_considerations
quality_checks.missing_key_details
quality_checks.contradictions_or_uncertainties
quality_checks.follow_up_questions
review_notice
```

Arrays such as `coding_suggestions` and `diagnostic_considerations` may need a
Formatter or Looping step in Zapier if you want each item rendered as a table
row or separate bullet.

