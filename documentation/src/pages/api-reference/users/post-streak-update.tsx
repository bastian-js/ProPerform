import Heading from "../../../components/docs/Heading";
import Text from "../../../components/docs/Text";
import CodeBlock from "../../../components/docs/CodeBlock";
import Label from "../../../components/Label";

export default function PostStreakUpdate() {
  return (
    <div className="px-6 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <code>POST /streak/update</code>
        <Label text="Protected route" color="#F59E0B" />
      </div>

      <Text>
        Updates the authenticated user&apos;s streak for a specific activity
        type. Creates today&apos;s streak log (if not already logged),
        calculates the current streak, and updates the longest streak.
      </Text>

      <Heading>Authorization Header</Heading>
      <CodeBlock language="http" code={`Authorization: Bearer <JWT_TOKEN>`} />

      <Heading>Request Body</Heading>
      <CodeBlock
        language="json"
        code={`{
  "type": "training"
}`}
      />

      <Heading>Field Requirements</Heading>
      <CodeBlock
        language="text"
        code={`type  (string, required, e.g. "training", "nutrition")`}
      />

      <Heading>Success Response (200) - Updated</Heading>
      <CodeBlock
        language="json"
        code={`{
  "message": "streak updated succesfully.",
  "current_streak": 5,
  "longest_streak": 12
}`}
      />

      <Heading>Success Response (200) - Already Updated Today</Heading>
      <CodeBlock
        language="json"
        code={`{
  "message": "streak already updated today.",
  "current_streak": 5,
  "longest_streak": 12
}`}
      />

      <Heading>Error Responses</Heading>
      <CodeBlock
        language="json"
        code={`// Missing type (400)
{
  "message": "type is required."
}

// Unauthorized (401)
{
  "error": "Unauthorized"
}

// Server error (500)
{
  "message": "server error.",
  "error": "error details"
}`}
      />

      <Heading>Requirements</Heading>
      <Text>Requires authentication and a valid streak type in the body.</Text>
    </div>
  );
}
