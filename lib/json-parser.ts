/**
 * Clean a JSON string by escaping unescaped control characters within string literals.
 * This is particularly useful when parsing LLM outputs which may contain raw newlines or tabs
 * inside JSON string values.
 */
export function cleanJsonString(jsonString: string): string {
  let result = "";
  let inString = false;
  let escaped = false;
  
  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString[i];
    
    if (inString) {
      if (escaped) {
        result += char;
        escaped = false;
      } else if (char === "\\") {
        result += char;
        escaped = true;
      } else if (char === '"') {
        result += char;
        inString = false;
      } else if (char.charCodeAt(0) < 32) {
        // Escape control characters
        if (char === "\n") result += "\\n";
        else if (char === "\r") result += "\\r";
        else if (char === "\t") result += "\\t";
        else {
          const hex = char.charCodeAt(0).toString(16).padStart(4, "0");
          result += "\\u" + hex;
        }
      } else {
        result += char;
      }
    } else {
      if (char === '"') {
        inString = true;
      }
      result += char;
    }
  }
  return result;
}

/**
 * Robust JSON parser that strips markdown code blocks, extracts JSON substrings,
 * and sanitizes control characters before parsing.
 */
export function parseJson(text: string): any {
  let cleaned = text.trim();
  
  // 1. Strip markdown code block wrappers
  const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match) {
    cleaned = match[1].trim();
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```json?\s*/i, "").replace(/```$/i, "").trim();
  } else {
    // 2. Try to extract outermost JSON object/array
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');
    let startIdx = -1;
    let endIdx = -1;
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      startIdx = firstBrace;
      endIdx = lastBrace;
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
      endIdx = lastBracket;
    }
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      cleaned = cleaned.substring(startIdx, endIdx + 1);
    }
  }
  
  // 3. Escape control characters in string literals
  const sanitized = cleanJsonString(cleaned);
  
  return JSON.parse(sanitized);
}
