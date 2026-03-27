import Heading from "../../../components/docs/Heading";
import Text from "../../../components/docs/Text";
import CodeBlock from "../../../components/docs/CodeBlock";
import Label from "../../../components/Label";

export default function PostStreakType() {
  return (
    <div className="px-6 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <code>POST /streak/:type</code>
        <Label text="Protected route" color="#F59E0B" />
      </div>

      <Text>
        Returns streak information for the authenticated user by activity type,
        including current streak, longest streak, and last activity date.
      </Text>

      <Heading>Authorization Header</Heading>
      <CodeBlock language="http" code={`Authorization: Bearer <JWT_TOKEN>`} />

      <Heading>Path Parameters</Heading>
      <CodeBlock
        language="text"
        code={`type  (string, required, streak category in the URL)`}
      />

      <Heading>Request Body</Heading>
      <CodeBlock
        language="json"
        code={`{
  "type": "training"
}`}
      />

      <Heading>Success Response (200) - Streak Found</Heading>
      <CodeBlock
        language="json"
        code={`{
  "current_streak": 5,
  "longest_streak": 12,
  "last_activity_date": "2026-03-27T00:00:00.000Z"
}`}
      />

      <Heading>Success Response (200) - No Streak Yet</Heading>
      <CodeBlock
        language="json"
        code={`{
  "current_streak": 0,
  "longest_streak": 0,
  "last_activity_date": null
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
      <Text>
        Requires authentication and a type value. Send the same type in the URL
        and request body for consistency.
      </Text>
    </div>
  );
}
