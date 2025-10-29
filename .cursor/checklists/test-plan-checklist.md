# Test Plan Checklist

- [ ] 사용자의 실제 행동과 화면 변화를 중심으로 테스트를 설계했는가?

- [ ] 내부 구현(data-testid, container.querySelector)이 아닌 접근을 사용했는가?

- [ ] @testing-library/jest-dom의 matcher (toBeVisible, toHaveTextContent, 등)를 활용했는가?

- [ ] 비동기 동작에는 findBy\* 또는 적절한 waitFor를 사용했는가?

- [ ] act()를 불필요하게 감싸지 않았는가?

- [ ] 테스트가 화면 변경에 과도하게 의존하지 않도록 쿼리를 설계했는가?

- [ ] ESLint 규칙을 적용했는가? (eslint-plugin-testing-library, eslint-plugin-jest-dom)
