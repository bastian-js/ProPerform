import Heading from "../../../components/docs/Heading";
import Text from "../../../components/docs/Text";
import CodeBlock from "../../../components/docs/CodeBlock";
import Label from "../../../components/Label";

export default function PutUsersMe() {
  return (
    <div className="px-6 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <code>PUT /users/me</code>
        <Label text="Protected route" color="#F59E0B" />
      </div>

      <Text>
        Updates the authenticated user profile fields. Only provided fields are
        updated. Requires authentication.
      </Text>

      <Heading>Important: Partial Updates</Heading>
      <Text>
        You do <strong>not</strong> need to send all fields. Only fields that
        are included in the request body are updated. All other fields stay
        unchanged.
      </Text>

      <Heading>Authorization Header</Heading>
      <CodeBlock language="http" code={`Authorization: Bearer <JWT_TOKEN>`} />

      <Heading>Request Body</Heading>
      <CodeBlock
        language="json"
        code={`{
  "weight": 78.5,
  "height": 182,
  "fitness_level": "intermediate",
  "training_frequency": 4,
  "primary_goal": "muscle gain"
}`}
      />

      <Heading>Example: Update Only One Field</Heading>
      <CodeBlock
        language="json"
        code={`{
    "weight": 79
  }`}
      />

      <Heading>Field Requirements</Heading>
      <CodeBlock
        language="text"
        code={`weight              (number, optional, > 0)
height              (number, optional, > 0)
fitness_level       (string, optional, must be in allowedFitnessLevels)
training_frequency  (number, optional, 0 to 14)
primary_goal        (string, optional, non-empty)`}
      />

      <Heading>Success Response (200)</Heading>
      <CodeBlock
        language="json"
        code={`{
  "message": "user updated successfully."
}`}
      />

      <Heading>Error Responses</Heading>
      <CodeBlock
        language="json"
        code={`// Invalid fitness level (400)
{
  "message": "fitness_level has to be one of the available fitness levels",
  "allowedFitnessLevels": ["beginner", "intermediate", "advanced"]
}

// Invalid weight (400)
{
  "message": "weight must be a positive number."
}

// Invalid height (400)
{
  "message": "height must be a positive number."
}

// Invalid training_frequency (400)
{
  "message": "training_frequency must be a number between 0 and 14."
}

// Invalid primary_goal (400)
{
  "message": "primary_goal must be a non-empty string."
}

// No valid fields provided (400)
{
  "message": "no valid fields to update."
}

// Unauthorized (401)
{
  "error": "Unauthorized"
}

// Server error (500)
{
  "message": "failed to update user."
}`}
      />

      <Heading>Notes</Heading>
      <Text>
        Send only fields you want to update. If no valid fields are included,
        the endpoint returns <code>400</code>.
      </Text>
    </div>
  );
}
